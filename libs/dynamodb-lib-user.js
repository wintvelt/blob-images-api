import { dynamoDb, dbUpdateMulti } from 'blob-common/core/db';
import { now } from 'blob-common/core/date';

export const getLoginUser = async (userId, cognitoId) => {
    const Key = {
        PK: 'USER',
        SK: userId,
    };

    const result = await dynamoDb.get({
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
        IndexName: process.env.cognitoIndex,
        KeyConditionExpression: '#c = :c',
        ExpressionAttributeNames: { '#c': 'cognitoId' },
        ExpressionAttributeValues: { ':c': cognitoId },
    };
    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        console.log(`no user found with cognitoId "${cognitoId}"`);
        return undefined;
    };

    const userId = result.items[0].SK;
    return await getUser(userId);
};
