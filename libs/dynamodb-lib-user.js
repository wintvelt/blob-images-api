import { now } from './helpers';
import dynamoDb, { dbUpdateMulti } from './dynamodb-lib';

export const getLoginUser = async (userId, cognitoId) => {
    const Key = {
        PK: 'USER',
        SK: userId,
    };

    const result = await dynamoDb.get({
        TableName: process.env.photoTable,
        Key
    });
    const oldUser = result.Item;
    if (!oldUser) {
        throw new Error("User not found.");
    }
    const today = now();
    const newVisitDatePrev = oldUser.visitDateLast || today;
    const isNewVisit = (!oldUser.visitDateLast || today > oldUser.visitDateLast);
    const hasNoCognitoId = !oldUser.cognitoId;
    const visitDateUpdate = (isNewVisit) ?
        { visitDateLast: today, visitDatePrev: newVisitDatePrev }
        : {};
    const visitUpdate = (hasNoCognitoId) ? { ...visitDateUpdate, cognitoId } : visitDateUpdate;
    if (isNewVisit || hasNoCognitoId) await dbUpdateMulti('UVvisit', Key.SK, visitUpdate);
    return {
        ...oldUser,
        ...visitUpdate
    };
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
    if (!foundUsers) throw new Error("could not query database for users");
    if (foundUsers.length === 0) return undefined;

    const result2 = await dynamoDb.get({
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: foundUsers[0].SK
        }
    });
    const user = result2.Item;
    if (!user) return undefined;

    return user;
};

export const getUser = async (userId) => {
    const params = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'USER',
            SK: userId,
        }
    };
    const result = await dynamoDb.get(params);
    const oldUser = result.Item;
    if (!oldUser) {
        throw new Error("User not found.");
    }
    return oldUser;
};

export const getUserByCognitoId = async (cognitoId) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.cognitoIndex,
        KeyConditionExpression: '#c = :c',
        ExpressionAttributeNames: { '#c': 'cognitoId' },
        ExpressionAttributeValues: { ':c': cognitoId },
    };
    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) throw new Error("user not found.");

    const userId = result.items[0].SK;
    return await getUser(userId);
};
