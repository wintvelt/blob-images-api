import handler from "../libs/handler-lib";
import ses from "../libs/ses-lib";

import { expireDate, otoa } from '../libs/helpers';
import { getMember, getUserByEmail } from "../libs/dynamodb-lib";
import { invite } from "../emails/invite";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;

    const data = JSON.parse(event.body);
    const { toName, toEmail, message } = data;

    const member = await getMember(userId, groupId);
    if (!member || member.role !== 'admin') throw new Error('not authorized to invite new');
    const { group, user } = member;
    const invitedUser = await getUserByEmail(toEmail);
    const inviteeId = invitedUser ? invitedUser.SK : toEmail;

    const inviteKey = {
        PK: 'UM' + inviteeId,
        SK: groupId
    };
    const url = `${process.env.FRONTEND}/invites/${otoa(inviteKey)}`;
    const inviteParams = {
        toName,
        toEmail,
        fromName: user.name,
        groupName: group.name,
        url,
        expirationDate: expireDate(member.createdAt),
        message
    };
    const result = await ses.send(invite(inviteParams));
    return result;
});
