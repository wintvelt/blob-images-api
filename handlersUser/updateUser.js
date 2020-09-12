import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const newUser = {
        name: data.name || null,
        avatar: data.avatar || null
    };
    const userParams = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: userId,
        },
        UpdateExpression: "SET #name = :name, avatar = :avatar",
        ExpressionAttributeNames: {
            '#name': 'name',
        },
        ExpressionAttributeValues: {
            ":name": newUser.name,
            ":avatar": newUser.avatar,
        },
        ReturnValues: "ALL_NEW"
    };

    await dynamoDb.update(userParams);

    return { status: true };
});