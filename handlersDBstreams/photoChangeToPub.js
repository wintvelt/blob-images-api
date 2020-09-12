import { dbUpdate } from '../libs/dynamodb-lib';
import { cleanRecord } from '../libs/dynamodb-lib-clean';
import { listPhotoPublications } from '../libs/dynamodb-lib-photo';

export const updatePubPhoto = async (newPhoto) => {
    const photo = cleanRecord(newPhoto);
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