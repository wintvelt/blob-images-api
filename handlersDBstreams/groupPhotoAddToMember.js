import { dbUpdate } from '../libs/dynamodb-lib';
import { getMembersAndInvites } from '../libs/dynamodb-lib-memberships';

export const updateMemberSeenPics = async (newGroupPhoto) => {
    const photoId = newGroupPhoto.SK;
    const groupId = newGroupPhoto.PK.split('#')[0].slice(2);
    const membersToUpdate = await getMembersAndInvites(groupId);
    const membersCount = membersToUpdate.length;
    let updatePromises = [];

    for (let i = 0; i < membersCount; i++) {
        const member = membersToUpdate[i];
        const newSeenPics = (member.seenPics) ? [...member.seenPics, { photoId }] : [{ photoId }];
        const memberUpdatePromise = dbUpdate(member.PK, member.SK, 'seenPics', newSeenPics);
        updatePromises.push(memberUpdatePromise);
    }

    return updatePromises;
};