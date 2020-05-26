import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const groupId = event.pathParameters.id;
    if (groupId === 'new') return '';

    const params = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'GBbase',
            SK: groupId,
        }
    };
    const result = await dynamoDb.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }
    return result.Item;
});
