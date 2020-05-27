import AWS from "aws-sdk";
import { splitArr } from './helpers';

const client = new AWS.DynamoDB.DocumentClient();

const splitTransact = (params) => {
    const transactions = params.TransactItems;
    const bundledTransactions = splitArr(transactions, 25);
    return Promise.all(
        bundledTransactions.map(transactionSet => {
            const bundledParams = {
                TransactItems: transactionSet
            };
            return client.transactWrite(bundledParams).promise()
        })
    )
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

export const checkUser = async (cognitoId, groupId) => {
    const memberParams = {
        TableName: process.env.photoTable,
        Keys: {
            PK: 'UMU' + cognitoId,
            SK: groupId
        },
    };
    const result = await dynamoDb.get(memberParams);
    return (!!result.Item);
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
        id: item.PK.slice(2),
        owner: item.owner,
        image: item.image,
        date: item.createdAt,
    }));

    return photos;
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

export default dynamoDb;