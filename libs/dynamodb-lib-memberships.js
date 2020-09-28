import { dynamoDb } from 'blob-common/core/db';
import { now, expireDate } from 'blob-common/core/date';

export const getMembershipsAndInvites = async (userId) => {
    const params = {
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

export const getMembersAndInvites = async (groupId) => {
    const params = {
        IndexName: process.env.photoIndex,
        KeyConditionExpression: "#sk = :group and begins_with(PK, :mem)",
        ExpressionAttributeNames: {
            '#sk': 'SK',
        },
        ExpressionAttributeValues: {
            ":group": groupId,
            ':mem': 'UM'
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items || [];

    const today = now();
    return items.filter(item => item.status !== 'invite' || expireDate(item.createdAt) >= today);
};