import { dbUpdate } from 'blob-common/core/db';
import { getPhotoById, getPhotoDirect } from '../libs/dynamodb-lib-single';


export const updatePhotoRating = async (rating) => {
    console.log({ rating });
    const newUserRating = parseInt(rating.rating || 0);
    const prevRating = parseInt(rating.prevRating || 0);
    const photoId = rating.PK.slice(2);
    const userId = rating.SK;
    const photoWithAccess = await getPhotoById(photoId, userId);
    let photoOwnerId;
    let oldPhotoRating = 0;
    let newRating;
    if (photoWithAccess) {
        photoOwnerId = photoWithAccess.SK;
        oldPhotoRating = parseInt(photoWithAccess.rating || 0);
        newRating = newUserRating;
    } else {
        // NB if the groupPhoto is removed, the user no longer has access. Photo rating should then be updated with zero
        const photoToUpdate = await getPhotoDirect(photoId);
        if (!photoToUpdate) throw new Error('photo for ratingupdate not found');
        photoOwnerId = photoToUpdate.SK;
        oldPhotoRating = parseInt(photoToUpdate.rating || 0);
        newRating = 0;
    };

    const newPhotoRating = oldPhotoRating + newRating - prevRating;
    console.log({ oldPhotoRating, newRating, prevRating, newPhotoRating });

    return dbUpdate('PO' + photoId, photoOwnerId, 'rating', newPhotoRating);
};