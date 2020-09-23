import { dbUpdate } from 'blob-common/core/db';
import { listPhotoPublications } from '../libs/dynamodb-lib-photo';

export const updatePubPhoto = async (photo) => {
    const photoId = photo.PK.slice(2);

    const publications = await listPhotoPublications(photoId);
    let updatePromises = [];
    for (let j = 0; j < publications.length; j++) {
        const pub = publications[j];
        const pubUpdate = dbUpdate(pub.PK, pub.SK, 'photo', photo);
        updatePromises.push(pubUpdate);
    };

    return updatePromises;
};