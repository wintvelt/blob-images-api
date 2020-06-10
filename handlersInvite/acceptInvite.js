import handler from "../libs/handler-lib";
import { getInvite } from './inviteHelpers';
import dynamoDb, { getUser } from "../libs/dynamodb-lib";
import { now } from "../libs/helpers";
import ses from "../libs/ses-lib";
import { acceptedInvite } from "../emails/acceptedInvite";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const inviteId = event.pathParameters.id;
    const invite = await getInvite(userId, inviteId);

    // check if invite is to user
    const inviteIsForThisUser = (invite.PK.slice(2) === userId);

    if (inviteIsForThisUser) {
        // update the invite to membership
        await dynamoDb.update({
            TableName: process.env.photoTable,
            Key: { PK: invite.PK, SK: invite.SK },
            UpdateExpression: "SET #status = :status",
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ":status": 'active',
            },
            ReturnValues: "NONE"
        });
    } else {
        // create membership for this user
        const user = await getUser(userId);
        await dynamoDb.transact({
            TransactItems: [
                {
                    Delete: {
                        TableName: process.env.photoTable,
                        Key: { PK: invite.PK, SK: invite.SK },
                    }
                },
                {
                    Put: {
                        TableName: process.env.photoTable,
                        Item: {
                            ...invite,
                            PK: 'UM' + userId,
                            user,
                            status: 'active',
                            createdAt: now(),
                        }
                    }
                }
            ]
        });
    }

    const mailParams = {
        toName: invite.invitation.from.name,
        toEmail: invite.invitation.from.email,
        fromName: invite.user.name,
        groupName: invite.group.name,
        url: `${process.env.FRONTEND}/personal/groups/${invite.group.id}`,
    };

    await ses.send(acceptedInvite(mailParams));

    return 'done';
});
