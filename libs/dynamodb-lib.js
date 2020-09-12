import AWS from "aws-sdk";
import { splitArr } from './helpers';

if (process.env.NODE_ENV === 'test') AWS.config.update({ region: 'eu-central-1' });
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

export default dynamoDb;

export const dbUpdate = (PK, SK, key, newValue) => (dynamoDb.update({
    TableName: process.env.photoTable,
    Key: {
        PK,
        SK,
    },
    UpdateExpression: "SET #k = :k",
    ExpressionAttributeNames: {
        '#k': key,
    },
    ExpressionAttributeValues: {
        ":k": newValue,
    },
    ReturnValues: "ALL_NEW"
}));

export const dbUpdateMulti = (PK, SK, newKV) => {
    const keys = Object.keys(newKV);
    let UpdateExpression = "SET ";
    let ExpressionAttributeNames = {};
    let ExpressionAttributeValues = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i > 0) UpdateExpression += ', ';
        UpdateExpression += `#k${i} = :k${i}`;
        ExpressionAttributeNames[`#k${i}`] = key;
        ExpressionAttributeValues[`:k${i}`] = newKV[key];
    };
    return dynamoDb.update({
        TableName: process.env.photoTable,
        Key: {
            PK,
            SK,
        },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW"
    });
};