import handler from "../libs/handler-lib";
import dynamoDb, { getMemberRole } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const albumId = event.pathParameters.albumid;
    if (groupId === 'new') return '';

    const memberRole = await getMemberRole(userId, groupId);
    if (!memberRole) throw new Error('not a member of this group');
    const userIsAdmin = (memberRole === 'admin');

    const params = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'GA' + groupId,
            SK: albumId,
        }
    };
    const result = await dynamoDb.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }
    return { ...result.Item, userIsAdmin };
});
