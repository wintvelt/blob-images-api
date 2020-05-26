import handler from "../libs/handler-lib";
import dynamoDb, { getMemberships } from "../libs/dynamodb-lib";

const memberUpdate = (PK, SK, newUser) => ({
    Update: {
        TableName: process.env.photoTable,
        Key: {
            PK,
            SK,
        },
        UpdateExpression: "SET #user = :newUser",
        ExpressionAttributeNames: {
            '#user': 'user',
        },
        ExpressionAttributeValues: {
            ":newuser": newUser,
        },
        ReturnValues: "ALL_NEW"
    }
});

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
    const memberships = getMemberships(userId);
    const membershipUpdates = (await memberships).map(item => memberUpdate(item.PK, item.SK, newUser));

    await dynamoDb.transact({
        TransactItems: [
            { Update: userParams },
            ...membershipUpdates
        ]
    });

    return { status: true };
});