import { dynamoDb } from 'blob-common/core/db';

export const decPhotoCount = async (Keys) => {
    const userId = Keys.SK;

    const statsUpdate = {
        UpdateExpression: 'SET #count = #count - :val',
        ExpressionAttributeNames: { '#count': 'photoCount' },
        ExpressionAttributeValues: { ':val': 1 }
    };

    const updatePromise = dynamoDb.update({
        Key: {
            PK: 'UPstats',
            SK: userId
        },
        ...statsUpdate
    });

    return updatePromise;
};