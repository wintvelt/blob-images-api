import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const params = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: 'U' + event.requestContext.identity.cognitoIdentityId,
        },
        UpdateExpression: "SET #name = :name, avatar = :avatar",
        ExpressionAttributeNames: {
            '#name': 'name',
        },
        ExpressionAttributeValues: {
            ":name": data.name || null,
            ":avatar": data.avatar || null
        },
        ReturnValues: "ALL_NEW"
    };

    await dynamoDb.update(params);

    return { status: true };
});