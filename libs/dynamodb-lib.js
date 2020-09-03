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
    return membership && (membership.status !== 'invite') && membership.role;
};
export const checkUser = async (userId, groupId) => {
    const groupRole = await getMemberRole(userId, groupId);
    return (!!groupRole);
};

export const getPhotoByUser = async (photoId, userId) => {
    const params = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'PO' + photoId,
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

export const getPhotoByGroupAlbum = async (photoId, groupId, albumId) => {
    const params = {
        TableName: process.env.photoTable,
        Key: {
            PK: `GA${groupId}#${albumId}`,
            SK: photoId,
        }
    };

    const result = await dynamoDb.get(params);
    const photo = result.Item?.photo;
    if (!photo) {
        throw new Error("Photo not found.");
    }

    // Return the retrieved item
    return photo;
};

export default dynamoDb;