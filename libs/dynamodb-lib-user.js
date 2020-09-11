import { now } from './helpers';
import dynamoDb from './dynamodb-lib';

export const getLoginUser = async (userId) => {
    const params = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: userId,
        }
    };
    const result = await dynamoDb.get(params);
    const oldUser = result.Item;
    if (!oldUser) {
        throw new Error("Item not found.");
    }
    const today = now();
    const isNewVisit = (!oldUser.visitDateLast || today > oldUser.visitDateLast);
    if (isNewVisit) {
        const newVisitDatePrev = oldUser.visitDateLast || today;
        const updatedUser = await dynamoDb.update({
            ...params,
            UpdateExpression: 'SET #vl = :vl, #vp = :vp',
            ExpressionAttributeNames: {
                "#vl": "visitDateLast",
                "#vp": "visitDatePrev"
            },
            ExpressionAttributeValues: {
                ":vl": today,
                ":vp": newVisitDatePrev
            },
            ReturnValues: "ALL_NEW"
        });
        return updatedUser.Attributes;
    }
    return oldUser;
};

export const getUserByEmail = async (email) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.emailIndex,
        KeyConditionExpression: '#p = :p and #e = :e',
        ExpressionAttributeNames: { '#p': 'PK', '#e': 'email' },
        ExpressionAttributeValues: { ':p': 'UBbase', ':e': email }
    };
    const result = await dynamoDb.query(params);
    const foundUsers = result.Items;
    if (!foundUsers) throw new Error("user not found.");

    const result2 = await dynamoDb.get({
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: foundUsers[0].SK
        }
    });
    const user = result2.Item;
    if (!user) throw new Error("user not found.");

    return user;
};
