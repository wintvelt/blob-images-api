import { dynamoDb } from 'blob-common/core/db';
import { listPhotos } from '../libs/dynamodb-lib-photo';

export const delUserPhotos = async (Keys) => {
    const userId = Keys.SK;

    const userPhotos = await listPhotos(userId);
    const userPhotoCount = userPhotos.length;

    let delPromises = [];

    for (let i = 0; i < userPhotoCount; i++) {
        const photo = userPhotos[i];
        delPromises.push(dynamoDb.delete({
            Key: {
                PK: photo.PK,
                SK: photo.SK
            }
        }));
    }

    console.log(`deleted ${delPromises.length} photos of deleted user`);
    return delPromises;
};