import { getMembersAndInvites } from '../libs/dynamodb-lib-memberships';
import { dbUpdate } from '../libs/dynamodb-lib';
import { cleanRecord } from '../libs/dynamodb-lib-clean';

export const updateMemberGroup = async (newGroup) => {
    const group = cleanRecord(newGroup);
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