import handler from "../libs/handler-lib";
import dynamoDb, { getMemberships } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;

    const photoParams = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'PO' + event.pathParameters.id,
            SK: userId,
        },
        ReturnValues: "ALL_OLD"
    };

    const result = await dynamoDb.delete(photoParams);
    if (!result.Attributes) {
        throw new Error("Photo not found.");
    };
    const photoUrl = result.Attributes.url;

    const groups = await getMemberships(userId);
    const groupUpdate = await dynamoDb.transact({
        TransactItems: groups.map(group => ({
            Update: {
                TableName: process.env.photoTable,
                Key: {
                    PK: 'GBbase',
                    SK: item.SK
                },
                UpdateExpression: "REMOVE #image, #imageUrl",
                ConditionExpresssion: '#imageUrl = :photoUrl',
                ExpressionAttributeNames: {
                    '#image': 'image',
                    '#imageUrl': 'imageUrl',
                },
                ExpressionAttributeValues: {
                    ":photoUrl": photoUrl,
                },
            }
        }))
    })

    // Return the retrieved item
    return result.Item;
});
