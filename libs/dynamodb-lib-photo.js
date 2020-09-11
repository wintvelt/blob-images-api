import dynamoDb from './dynamodb-lib';

export const listPhotos = async (userId) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.photoIndex,
        KeyConditionExpression: "#u = :user and begins_with(PK, :p)",
        ExpressionAttributeNames: {
            '#u': 'SK',
        },
        ExpressionAttributeValues: {
            ":user": userId,
            ":p": 'PO',
        },
    };

    const result = await dynamoDb.query(params);
    const photos = result.Items;
    if (!photos) {
        throw new Error("photos retrieval failed.");
    }

    return photos;
};