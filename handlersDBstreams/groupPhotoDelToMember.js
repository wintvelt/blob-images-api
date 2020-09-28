import { dbUpdate } from 'blob-common/core/db';
import { getMembersAndInvites } from '../libs/dynamodb-lib-memberships';

export const cleanMemberSeenPics = async (groupPhotoKeys) => {
    const photoId = groupPhotoKeys.SK;
    const groupId = groupPhotoKeys.PK.split('#')[0].slice(2);
    const albumId = groupPhotoKeys.PK.split('#')[1];
    const membersToUpdate = await getMembersAndInvites(groupId);
    const membersCount = membersToUpdate.length;
    let updatePromises = [];

    for (let i = 0; i < membersCount; i++) {
        const member = membersToUpdate[i];
        const seenPics = member.seenPics;
        if (seenPics && seenPics.length > 0) {
            const newSeenPics = seenPics.filter(pic => (pic.photoId !== photoId || pic.albumId !== albumId));
            const memberUpdatePromise = dbUpdate(member.PK, member.SK, 'seenPics', newSeenPics);
            updatePromises.push(memberUpdatePromise);
        }
    }

    return updatePromises;
};