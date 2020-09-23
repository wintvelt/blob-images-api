import { dynamoDb } from 'blob-common/core/db';
import { listPhotos } from '../libs/dynamodb-lib-photo';

export const updatePhotoUser = async (user) => {
    const userId = user.SK;
    const photosToUpdate = await listPhotos(userId);
    const photoCount = photosToUpdate.length;
    let updatePromises = [];
    for (let i = 0; i < photoCount; i++) {
        const photo = photosToUpdate[i];
        const photoUpdate = {
            UpdateExpression: 'SET #u = :u',
            ExpressionAttributeNames: { '#u': 'user' },
            ExpressionAttributeValues: { ':u': user }
        };

        const photoUpdatePromise = dynamoDb.update({
            Key: {
                PK: photo.PK,
                SK: photo.SK
            },
            ...photoUpdate
        });
        updatePromises.push(photoUpdatePromise);
    }
    return updatePromises;
};