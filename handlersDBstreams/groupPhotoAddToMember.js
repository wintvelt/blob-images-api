import { dbUpdate } from 'blob-common/core/db';
import { getMembersAndInvites } from '../libs/dynamodb-lib-memberships';

export const updateMemberSeenPics = async (newGroupPhoto) => {
    const photoId = newGroupPhoto.SK;
    const groupId = newGroupPhoto.PK.split('#')[0].slice(2);
    const albumId = newGroupPhoto.PK.split('#')[1];
    const photoOwnerId = newGroupPhoto.photo.user.SK;
    const members = await getMembersAndInvites(groupId);
    const membersToUpdate = members.filter(mem => mem.PK.slice(2) !== photoOwnerId);
    const membersCount = membersToUpdate.length;
    let updatePromises = [];

    for (let i = 0; i < membersCount; i++) {
        const member = membersToUpdate[i];
        const newSeenPics = (member.seenPics) ? [...member.seenPics, { albumId, photoId }] : [{ albumId, photoId }];
        const memberUpdatePromise = dbUpdate(member.PK, member.SK, 'seenPics', newSeenPics);
        updatePromises.push(memberUpdatePromise);
    }

    return updatePromises;
};