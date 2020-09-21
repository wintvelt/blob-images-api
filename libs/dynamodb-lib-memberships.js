import { dynamoDb } from 'blob-common/core/db';
import { now, expireDate } from 'blob-common/core/date';

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
    const items = result.Items || [];

    const today = now();
    return items.filter(item => item.status !== 'invite' || expireDate(item.createdAt) >= today);
};

export const getMemberships = async (userId) => {
    const items = await getMembershipsAndInvites(userId);
    return items.filter(item => item.status !== 'invite');
};

export const getMembers = async (groupId) => {
    const items = await getMembersAndInvites(groupId);
    return items.filter(item => item.status !== 'invite');
};