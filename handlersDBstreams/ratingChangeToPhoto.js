import { dbUpdate } from 'blob-common/core/db';
import { cleanRecord } from 'blob-common/core/dbClean';
import { getPhotoById } from '../libs/dynamodb-lib-single';


export const updatePhotoRating = async (newRating) => {
    const rating = cleanRecord(newRating);
    const prevRating = rating.prevRating || 0;
    const photoId = rating.PK.slice(2);
    const userId = rating.SK;
    const photoToUpdate = await getPhotoById(photoId, userId);
    if (!photoToUpdate) return 'photo not found';

    const oldPhotoRating = photoToUpdate.rating || 0;
    const newPhotoRating = oldPhotoRating + rating.rating - prevRating;

    return dbUpdate(photoToUpdate.PK, photoToUpdate.SK, 'rating', newPhotoRating);
};