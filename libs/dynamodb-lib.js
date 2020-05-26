import AWS from "aws-sdk";

const client = new AWS.DynamoDB.DocumentClient();

const dynamoDb = {
    get: (params) => client.get(params).promise(),
    put: (params) => client.put(params).promise(),
    query: (params) => client.query(params).promise(),
    update: (params) => client.update(params).promise(),
    delete: (params) => client.delete(params).promise(),
    transact: (params) => client.transactWrite(params).promise()
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

export const getMemberships = (userId) => {
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
}
export default dynamoDb;