import { dbUpdate } from '../libs/dynamodb-lib';
import { cleanRecord } from '../libs/dynamodb-lib-clean';
import { listPhotoCovers } from '../libs/dynamodb-lib-photo';

export const updateCoverPhoto = async (newPhoto) => {
    const photo = cleanRecord(newPhoto);
    const photoId = photo.PK.slice(2);

    const covers = await listPhotoCovers(photoId);
    let updatePromises = [];
    for (let j = 0; j < covers.length; j++) {
        const cover = covers[j];
        if (cover.PK !== 'UBbase') {
            // skip user records, to prevent circular update triggers photo->user->photo
            const coverUpdate = dbUpdate(cover.PK, cover.SK, 'photo', photo);
            updatePromises.push(coverUpdate);
        }
    };

    return updatePromises;
};