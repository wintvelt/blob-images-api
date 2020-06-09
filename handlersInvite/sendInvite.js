import handler from "../libs/handler-lib";
import ses from "../libs/ses-lib";

import { expireDate, otob, now, sanitize } from '../libs/helpers';
import dynamoDb, { getMember, getUserByEmail } from "../libs/dynamodb-lib";
import { invite } from "../emails/invite";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;

    const data = JSON.parse(event.body);
    const { toName, toEmail, message, role } = data;
    const safeToName = sanitize(toName);
    const safeMessage = sanitize(message);
    const safeToEmail = sanitize(toEmail.toLowerCase());

    const member = await getMember(userId, groupId);
    if (!member || member.role !== 'admin') throw new Error('not authorized to invite new');
    const { group, user } = member;
    const invitedUser = await getUserByEmail(safeToEmail);
    if (invitedUser) {
        const invitedAlreadyMember = await getMember(invitedUser.SK, groupId);
        if (invitedAlreadyMember) return { status: 'already member' };
    };

    const inviteeId = invitedUser ? invitedUser.SK : safeToEmail;
    const inviteKey = {
        PK: 'UM' + inviteeId,
        SK: groupId
    };
    const createdAt = now();
    const inviteMembershipParams = {
        TableName: process.env.photoTable,
        Item: {
            PK: inviteKey.PK,
            SK: inviteKey.SK,
            role: role || 'guest',
            user: invitedUser || {
                name: safeToName,
                email: safeToEmail
            },
            group,
            comp: role,
            status: 'invite',
            invitation: {
                from: user,
                message: safeMessage
            },
            RND: 'GROUP',
            createdAt,
        },
    };
    const membership = await dynamoDb.put(inviteMembershipParams);
    if (!membership) throw new Error('could not create invite');

    const url = `${process.env.FRONTEND}/invites/${otob(inviteKey)}`;
    const inviteParams = {
        toName,
        toEmail: safeToEmail,
        fromName: user.name,
        groupName: group.name,
        url,
        expirationDate: expireDate(createdAt),
        message: safeMessage
    };
    const result = await ses.send(invite(inviteParams));
    if (!result) throw new Error('could not send invite');

    return { status: 'invite sent'};
});
