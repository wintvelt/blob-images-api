import { now } from './helpers';
import { dynamoDb } from './dynamodb-lib';

export const getUser = async (userId) => {
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
        const updatedUser = await dynamoDb.update({
            ...params,
            UpdateExpression: 'SET #vl = :vl, #vp = :vp',
            ExpressionAttributeNames: {
                "#vl": "visitDateLast",
                "#vp": "visitDatePrev"
            },
            ExpressionAttributeValues: {
                ":vl": today,
                ":vp": oldUser.visitDateLast || today
            },
            ReturnValues: "ALL_NEW"
        });
        const memberships = await getMemberships(userId)
        return updatedUser.Attributes;
    }
    return oldUser;
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