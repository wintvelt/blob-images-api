import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.photoIndex,
        KeyConditionExpression: "#u = :user and begins_with(PK, :p)",
        ExpressionAttributeNames: {
            '#u': 'SK',
        },
        ExpressionAttributeValues: {
            ":user": 'U' + event.requestContext.identity.cognitoIdentityId,
            ":p": 'PO',
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        throw new Error("photos retrieval failed.");
    }

    const photos = items.map(item => ({
        id: item.PK.slice(2),
        owner: item.owner,
        image: item.url,
        date: item.createdAt,
    }));

    return photos;
});