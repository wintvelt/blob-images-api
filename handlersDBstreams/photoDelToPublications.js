import { dynamoDb } from 'blob-common/core/db';
import { listPhotoPublications } from '../libs/dynamodb-lib-photo';

export const delPhotoPubs = async (Keys) => {
    const photoId = Keys.PK.slice(2);
    let delPromises = [];

    const publications = await listPhotoPublications(photoId);

    for (let i = 0; i < publications.length; i++) {
        const pub = publications[i];
        delPromises.push(dynamoDb.delete({
            Key: { PK: pub.PK, SK: pub.SK }
        }));
    }
    console.log(`photo also deleted from ${delPromises.length} publications in albums`);
    return delPromises;
};