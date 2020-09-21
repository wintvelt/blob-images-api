import { handler, getUserFromEvent } from "blob-common/core/handler";
import { ses } from "blob-common/core/ses";
import { expireDate, now } from 'blob-common/core/date';
import { otob } from 'blob-common/core/base64';
import { sanitize } from 'blob-common/core/sanitize';
import { dbCreateItem } from "blob-common/core/dbCreate";
import { cleanRecord } from "blob-common/core/dbClean";

import { getMember } from "../libs/dynamodb-lib-single";
import { getUserByEmail } from "../libs/dynamodb-lib-user";
import { invite } from "../emails/invite";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const groupId = event.pathParameters.id;

    const data = JSON.parse(event.body);
    const { toName, toEmail, message, role } = data;
    const safeToName = sanitize(toName);
    const safeMessage = sanitize(message);
    const safeToEmail = sanitize(toEmail.toLowerCase());

    const member = await getMember(userId, groupId);
    if (!member || member.role !== 'admin') throw new Error('not authorized to invite new');

    const { group, user } = member;
    const today = now();

    const invitedUser = await getUserByEmail(safeToEmail);
    if (invitedUser) {
        const invitedAlreadyInGroup = await getMember(invitedUser.SK, groupId);
        if (invitedAlreadyInGroup) {
            if (invitedUser.status !== 'invite') return { status: 'invitee is already member' };
            const hasActiveInvite = (expireDate(invitedUser.createdAt) > today);
            if (hasActiveInvite) return { status: 'invitee already has active invite' };
        };
    };

    const inviteeId = invitedUser ? invitedUser.SK : safeToEmail;
    const inviteKey = {
        PK: 'UM' + inviteeId,
        SK: groupId
    };
    const newMembership = await dbCreateItem({
        PK: inviteKey.PK,
        SK: inviteKey.SK,
        role: role || 'guest',
        user: (invitedUser) ? cleanRecord(invitedUser) : {
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
    });
    if (!newMembership) throw new Error('could not create invite');

    const url = `${process.env.FRONTEND}/invites/${otob(inviteKey)}`;
    const inviteParams = {
        toName,
        toEmail: safeToEmail,
        fromName: user.name,
        groupName: group.name,
        url,
        expirationDate: expireDate(today),
        message: safeMessage
    };
    console.log({ inviteParams });
    const result = await ses.send(invite(inviteParams));
    if (!result) throw new Error('could not send invite');

    return { status: 'invite sent' };
});
