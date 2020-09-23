import { dynamoDb } from 'blob-common/core/db';

export const listPhotos = async (userId) => {
    const params = {
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

export const listPhotoPublications = async (photoId) => {
    const params = {
        IndexName: process.env.photoIndex,
        KeyConditionExpression: "#p = :pid and begins_with(PK, :p)",
        ExpressionAttributeNames: {
            '#p': 'SK',
        },
        ExpressionAttributeValues: {
            ":pid": photoId,
            ":p": 'GP',
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    return items || [];
};

export const listPhotoCovers = async (photoId) => {
    const params = {
        IndexName: process.env.coverIndex,
        KeyConditionExpression: "#p = :pid",
        ExpressionAttributeNames: {
            '#p': 'photoId',
        },
        ExpressionAttributeValues: {
            ":pid": photoId
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    return items || [];
};