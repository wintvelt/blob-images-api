import { dbUpdateMulti, dynamoDb } from 'blob-common/core/db';
import { getMembersAndInvites } from '../libs/dynamodb-lib-memberships';
import { getPhotoById } from '../libs/dynamodb-lib-single';

export const clearMemberRating = async (groupPhotoKeys) => {
    const photoId = groupPhotoKeys.SK;
    const groupId = groupPhotoKeys.PK.split('#')[0].slice(2);
    const membersToCheck = await getMembersAndInvites(groupId);
    const membersCount = membersToCheck.length;
    let updatePromises = [];

    for (let i = 0; i < membersCount; i++) {
        const member = membersToCheck[i];
        const memberId = member.PK.slice(2);
        const accessToPhoto = await getPhotoById(photoId, memberId);
        if (!accessToPhoto) {
            const Key = { PK: 'UF' + photoId, SK: memberId };
            const ratingResult = await dynamoDb.get({ Key });
            const oldRating = ratingResult.Item;
            if (oldRating && oldRating.rating !== 0) {
                const ratingToZero = dbUpdateMulti(oldRating.PK, oldRating.SK, {
                    rating: 0,
                    prevRating: oldRating.rating
                });
                updatePromises.push(ratingToZero);
                const delRating = dynamoDb.delete({ Key });
                updatePromises.push(delRating);
            }
        }
    }

    return updatePromises;
};