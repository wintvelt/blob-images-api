import dynamoDb from './dynamodb-lib';

export const listPhotosByDate = async (userId) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.dateIndex,
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: {
            '#pk': 'PK',
        },
        ExpressionAttributeValues: {
            ":PK": 'PO' + userId,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    return items || [];
};

export const listGroupAlbums = async (groupId, groupRole) => {
    const params = {
        TableName: process.env.photoTable,
        KeyConditionExpression: "#g = :g",
        ExpressionAttributeNames: {
            '#g': 'PK',
        },
        ExpressionAttributeValues: {
            ":g": 'GA' + groupId,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        throw new Error("albums retrieval failed.");
    };
    const albums = items.map(item => ({
        PK: item.PK,
        SK: item.SK,
        id: item.SK,
        name: item.name,
        image: item.image,
        userIsAdmin: (groupRole === 'admin'),
        date: item.createdAt,
    }));
    return albums;
};

export const listAlbumPhotosByDate = async (groupId, albumId) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.dateIndex,
        KeyConditionExpression: "#t = :type",
        ExpressionAttributeNames: {
            '#t': 'type',
        },
        ExpressionAttributeValues: {
            ":type": `GP${groupId}#${albumId}`,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        throw new Error("album photos retrieval failed.");
    };
    return items;
};

export const listAlbumPhotos = async (groupId, albumId) => {
    const params = {
        TableName: process.env.photoTable,
        KeyConditionExpression: "#a = :groupAlbum",
        ExpressionAttributeNames: {
            '#a': 'PK',
        },
        ExpressionAttributeValues: {
            ":groupAlbum": `GP${groupId}#${albumId}`,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        throw new Error("album photos retrieval failed.");
    };
    const albumPhotos = items.map(item => ({
        ...item.photo,
        image: item.photo.url,
        id: item.photo.PK.slice(2),
        date: item.photo.createdAt,
    }));
    return albumPhotos;
};

export const listPhotoRatings = async (photoId) => {
    const params = {
        TableName: process.env.photoTable,
        KeyConditionExpression: "#pk = :pid",
        ExpressionAttributeNames: {
            '#pk': 'PK',
        },
        ExpressionAttributeValues: {
            ":pid": 'UF' + photoId,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items || [];
    return items;
};