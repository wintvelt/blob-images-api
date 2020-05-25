import handler from "../libs/handler-lib";
import dynamoDb, { checkUser } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const groupId = event.pathParameters.id;
    const cognitoId = event.requestContext.identity.cognitoIdentityId;
    const hasAccess = await checkUser(cognitoId, groupId);
    if (!hasAccess) throw new Error('no access');

    const groupPhotoParams = {
        TableName: process.env.photoTable,
        KeyConditionExpression: "#PK = :group",
        ExpressionAttributeNames: {
            '#PK': 'PK',
        },
        ExpressionAttributeValues: {
            ":group": groupId,
        },
    };

    const result = await dynamoDb.query(groupPhotoParams);
    const items = result.Items;
    if (!items) {
        throw new Error("photos retrieval failed.");
    }

    const photos = items.map(item => ({
        id: item.SK.split('#')[1],
        owner: item.owner,
        image: item.url,
        date: item.createdAt,
    }));

    return photos;
});
