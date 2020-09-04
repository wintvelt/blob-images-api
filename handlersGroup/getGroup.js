import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getMemberRole } from "../libs/dynamodb-lib-single";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    if (groupId === 'new') return '';

    const memberRole = await getMemberRole(userId, groupId);
    if (!memberRole) throw new Error('not a member of this group');
    const userIsAdmin = (memberRole === 'admin');

    const groupParams = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'GBbase',
            SK: groupId,
        }
    };
    const result = await dynamoDb.get(groupParams);
    if (!result.Item) {
        throw new Error("Item not found.");
    }
    return { ...result.Item, id: groupId, userIsAdmin };
});
