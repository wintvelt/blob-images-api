import { dbUpdate } from 'blob-common/core/db';
import { getMembersAndInvites } from '../libs/dynamodb-lib-memberships';

export const updateMemberGroup = async (group) => {
    const groupId = group.SK;
    const membersToUpdate = await getMembersAndInvites(groupId);
    const membersCount = membersToUpdate.length;
    let updatePromises = [];
    for (let i = 0; i < membersCount; i++) {
        const member = membersToUpdate[i];
        const memberUpdatePromise = dbUpdate(member.PK, member.SK, 'group', group);
        updatePromises.push(memberUpdatePromise);
    }
    return updatePromises;
};