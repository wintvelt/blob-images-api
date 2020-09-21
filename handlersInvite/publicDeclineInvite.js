import { handler, getUserFromEvent } from "blob-common/core/handler";
import { dynamoDb } from "blob-common/core/db";
import { ses } from "blob-common/core/ses";
import { getInvite } from './inviteHelpers';
import { declinedInvite } from "../emails/declinedInvite";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const inviteId = event.pathParameters.id;
    // get invite (throws error if invite not found or user has no access to invite)
    const invite = await getInvite(userId, inviteId);

    // delete the invite
    await dynamoDb.delete({
        TableName: process.env.photoTable,
        Key: { PK: invite.PK, SK: invite.SK },
    });

    const mailParams = {
        toName: invite.invitation.from.name,
        toEmail: invite.invitation.from.email,
        fromName: invite.user.name,
        groupName: invite.group.name,
        url: `${process.env.FRONTEND}/personal/groups/${invite.group.id}`,
    };
    console.log(JSON.stringify(mailParams, null, 2));

    await ses.send(declinedInvite(mailParams));

    return 'done';
});
