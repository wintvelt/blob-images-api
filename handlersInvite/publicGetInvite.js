import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { btoa, expireDate, now } from "../libs/helpers";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    let Key;
    try {
        Key = JSON.parse(btoa(event.pathParameters.id));
    } catch (_) {
        throw new Error('invite ID invalid');
    }
    // check if invite is for user, if so: must be logged in user
    const inviteIsForAuthUser = (Key.PK.slice(0, 3) === 'UMU') && (!Key.PK.includes('@'));
    if (inviteIsForAuthUser && Key.PK.slice(3) !== userId) throw new Error('invite not for you');

    const params = {
        TableName: process.env.photoTable,
        Key
    };

    const result = await dynamoDb.get(params);
    const invite = result.Item;
    if (!invite) {
        throw new Error("invite not found");
    }
    // check if invite is still an invite
    if (invite.status !== 'invite') throw new Error('invite already accepted');

    // check if invite is still valid
    const expirationDate = expireDate(invite.createdAt);
    if (now() > expirationDate) throw new Error('invite expired');

    // Return the retrieved item
    return invite;
});
