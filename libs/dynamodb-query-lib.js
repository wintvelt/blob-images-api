import dynamoDb from './dynamodb-lib';
import { now, expireDate } from './helpers';

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
    const items = result.Items;
    if (!items) {
        throw new Error("photos retrieval failed.");
    }

    const photos = items.map(item => ({
        ...item,
        id: item.PK.slice(2),
        image: item.url,
        date: item.createdAt,
    }));

    return photos;
};
export const listPhotosByDate = async (userId) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.dateIndex,
        KeyConditionExpression: "#t = :type",
        ExpressionAttributeNames: {
            '#t': 'type',
        },
        ExpressionAttributeValues: {
            ":type": 'PO' + userId,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        throw new Error("photos retrieval failed.");
    }
    return items;
};

export const getMembershipsAndInvites = async (userId) => {
    const params = {
        TableName: process.env.photoTable,
        KeyConditionExpression: "#u = :member",
        ExpressionAttributeNames: {
            '#u': 'PK',
        },
        ExpressionAttributeValues: {
            ":member": 'UM' + userId,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        throw new Error("membership retrieval failed.");
    }
    const today = now();
    return items.filter(item => item.status !== 'invite' || expireDate(item.createdAt) >= today);
};

export const getMemberships = async (userId) => {
    const items = await getMembershipsAndInvites(userId);
    return items.filter(item => item.status !== 'invite');
};

export const getMembersAndInvites = async (groupId) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.photoIndex,
        KeyConditionExpression: "#g = :grp and begins_with(PK, :p)",
        ExpressionAttributeNames: {
            '#g': 'SK',
        },
        ExpressionAttributeValues: {
            ":grp": groupId,
            ":p": 'UM',
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        throw new Error("members retrieval failed.");
    };
    const today = now();
    return items.filter(item => item.status !== 'invite' || expireDate(item.createdAt) >= today);
};
export const getMembers = async (groupId) => {
    const items = await getMembersAndInvites(groupId);
    return items.filter(item => item.status !== 'invite');
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

export const listPhotoPublications = async (photoId) => {
    const params = {
        TableName: process.env.photoTable,
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