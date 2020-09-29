import { dbUpdateMulti } from 'blob-common/core/db';
import { listPhotoCovers } from '../libs/dynamodb-lib-photo';

export const clearCovers = async (Keys) => {
    const photoId = Keys.PK.slice(2);

    let updatePromises = [];
    const covers = await listPhotoCovers(photoId);
    for (let j = 0; j < covers.length; j++) {
        const cover = covers[j];
        if (cover.PK === 'UBbase') {
            const coverUpdate = dbUpdateMulti(cover.PK, cover.SK, {
                photoId: '',
                photoUrl: ''
            });
            updatePromises.push(coverUpdate);
        } else if (cover.PK !== 'USER') {
            // skip USER record (will be done by stream propagation from base)
            const coverUpdate = dbUpdateMulti(cover.PK, cover.SK, {
                photoId: '',
                photo: ''
            });
            updatePromises.push(coverUpdate);
        }
    };

    console.log(`removed photo as cover from ${updatePromises.length} items`);
    return updatePromises;
};