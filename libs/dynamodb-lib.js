import AWS from "aws-sdk";
import { splitArr } from './helpers';

const client = new AWS.DynamoDB.DocumentClient();

const MAX_TRANSACTWRITE = 2;

const splitTransact = (params) => {
    const transactions = params.TransactItems;
    const bundledTransactions = splitArr(transactions, MAX_TRANSACTWRITE);
    return Promise.all(
        bundledTransactions.map(transactionSet => {
            const bundledParams = {
                TransactItems: transactionSet
            };
            return client.transactWrite(bundledParams).promise();
        })
    );
};

const dynamoDb = {
    get: (params) => client.get(params).promise(),
    put: (params) => client.put(params).promise(),
    query: (params) => client.query(params).promise(),
    update: (params) => client.update(params).promise(),
    delete: (params) => client.delete(params).promise(),
    transact: (params) => splitTransact(params),
};

export const getUser = async (userId) => {
    const params = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: userId,
        }
    };
    const result = await dynamoDb.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }
    // Return the retrieved item
    return result.Item;
};
export const getUserByEmail = async (email) => {
    const params = {
        TableName: process.env.photoTable,
        KeyConditionExpression: "#pk = :ubase",
        ExpressionAttributeNames: {
            '#pk': 'PK',
        },
        ExpressionAttributeValues: {
            ":ubase": 'UBbase',
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) throw new Error("users retrieval failed.");

    const userFound = items.find(user => (user.email === email));
    if (!userFound) return false;

    return userFound;
};
export const getMember = async (userId, groupId) => {
    const memberParams = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'UM' + userId,
            SK: groupId
        },
    };
    const result = await dynamoDb.get(memberParams);
    return (result.Item);
};
export const getMemberRole = async (userId, groupId) => {
    const membership = await getMember(userId, groupId);
    return membership.role;
};
export const checkUser = async (userId, groupId) => {
    const groupRole = await getMemberRole(userId, groupId);
    return (!!groupRole);
};

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
        PK: item.PK,
        SK: item.SK,
        id: item.PK.slice(2),
        owner: item.owner,
        image: item.url,
        date: item.createdAt,
    }));

    return photos;
};

export const getPhoto = async (photoId) => {
    const params = {
        TableName: process.env.photoTable,
        KeyConditionExpression: "#p = :photoId",
        ExpressionAttributeNames: {
            '#p': 'PK',
        },
        ExpressionAttributeValues: {
            ":photoId": 'PO' + photoId,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items || items.length === 0) {
        throw new Error("photo retrieval failed.");
    }
    return items[0];
};

export const getMemberships = async (userId) => {
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
    return items;
};

export const getMembers = async (groupId) => {
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
    }

    return items;
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

export default dynamoDb;