import handler, { getUserFromEvent } from "../libs/handler-lib";
import { getInvite } from './inviteHelpers';
import dynamoDb, { dbUpdate } from "../libs/dynamodb-lib";
import { getMember } from "../libs/dynamodb-lib-single";
import { getUser } from "../libs/dynamodb-lib-user";
import ses from "../libs/ses-lib";
import { acceptedInvite } from "../emails/acceptedInvite";
import { dbItem } from "../libs/dynamodb-create-lib";
import { cleanRecord } from "../libs/dynamodb-lib-clean";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const inviteId = event.pathParameters.id;
    const invite = await getInvite(userId, inviteId);

    // check if invite is to user
    const inviteIsForThisUser = (invite.PK.slice(2) === userId);

    if (inviteIsForThisUser) {
        // update the invite to membership
        await dbUpdate(invite.PK, invite.SK, 'status', 'active');
    } else {
        // invite is an email - create or update membership for this user
        let TransactItems = [
            {
                Delete: {
                    TableName: process.env.photoTable,
                    Key: { PK: invite.PK, SK: invite.SK },
                }
            },
        ];
        const user = await getUser(userId);
        // user may already be a member (with different email)
        const membership = await getMember(userId, invite.SK);
        const hasBetterRoleForMember = (membership && membership.role === 'guest' && invite.role === 'admin');
        if (hasBetterRoleForMember) TransactItems.push({
            Update: {
                TableName: process.env.photoTable,
                Key: { PK: 'UM' + userId, SK: invite.SK },
                UpdateExpression: 'SET #r = :r, #i = :i',
                ExpressionAttributeNames: { '#r': 'role', '#i': 'invitation' },
                ExpressionAttributeValues: { ':r': invite.role, ':i': invite.invitation },
            }
        });
        if (!membership) TransactItems.push({
            Put: {
                TableName: process.env.photoTable,
                Item: dbItem({
                    PK: 'UM' + userId,
                    SK: invite.SK,
                    user: cleanRecord(user),
                    invitation: invite.invitation,
                    group: invite.group,
                    role: invite.role,
                    status: 'active'
                })
            }
        });
        await dynamoDb.transact({ TransactItems });
    }

    const mailParams = {
        toName: invite.invitation.from.name,
        toEmail: invite.invitation.from.email,
        fromName: invite.user.name,
        groupName: invite.group.name,
        url: `${process.env.FRONTEND}/personal/groups/${invite.group.id}`,
    };
    console.log(JSON.stringify(mailParams, null, 2));

    await ses.send(acceptedInvite(mailParams));

    return 'done';
});
