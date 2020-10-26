import { dbUpdate, dbUpdateMulti, dynamoDb } from 'blob-common/core/db';
import { getMembersAndInvites } from '../libs/dynamodb-lib-memberships';

export const cleanGroupMembers = async (memberKeys) => {
    const groupId = memberKeys.SK;

    const groupKey = { PK: 'GBbase', SK: groupId };
    const groupResult = await dynamoDb.get({ Key: groupKey });
    const group = groupResult.Item;
    let groupPromises = [];
    let memUpdateCount = 0;
    let groupUpdateCount = 0;
    if (group) {
        const members = await getMembersAndInvites(groupId);
        if (members && members.length > 0) {
            // if needed, make all others admin
            const hasOtherAdmin = members.find(mem => (mem.role === 'admin'));
            const noFounderleft = !members.find(mem => (mem.isFounder));
            if (!hasOtherAdmin) {
                for (let i = 0; i < members.length; i++) {
                    const mem = members[i];
                    if (noFounderleft && i === 0) {
                        // make first found member founder
                        groupPromises.push(dbUpdateMulti(mem.PK, mem.SK, {
                            role: 'admin',
                            isFounder: true
                        }));
                    } else {
                        groupPromises.push(dbUpdate(mem.PK, mem.SK, 'role', 'admin'));
                    }
                    memUpdateCount++;
                }
            } else if (noFounderleft) {
                // make the (first) found admin also the founder
                groupPromises.push(dbUpdateMulti(hasOtherAdmin.PK, hasOtherAdmin.SK, {
                    isFounder: true
                }));
            }
        } else {
            // no members left, so delete group
            groupPromises.push(dynamoDb.delete({ Key: groupKey }));
            groupUpdateCount++;
        }
    }
    console.log(`${memUpdateCount} members upgraded to admin, ${groupUpdateCount} group deleted`);
    return groupPromises;
};