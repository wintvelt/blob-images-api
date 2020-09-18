import { getMembershipsAndInvites } from '../libs/dynamodb-lib-memberships';
import { dbUpdateMulti } from '../libs/dynamodb-lib';
import { cleanRecord } from '../libs/dynamodb-lib-clean';

export const updateMemberUser = async (newUser) => {
    const user = cleanRecord(newUser);
    const userId = user.SK;
    const today = user.visitDateLast;
    const membershipsToUpdate = await getMembershipsAndInvites(userId);
    const membershipsCount = membershipsToUpdate.length;
    let updatePromises = [];
    for (let i = 0; i < membershipsCount; i++) {
        const membership = membershipsToUpdate[i];
        const seenPics = membership.seenPics || [];
        let seenPicsChanged = false;
        const newSeenPics = seenPics
            .filter(pic => {
                if (!pic.seenDate || pic.seenDate === today) return true;
                seenPicsChanged = true;
                return false;
            })
            .map(pic => {
                if (pic.seenDate) return pic;
                seenPicsChanged = true;
                return { ...pic, seenDate: today };
            });
        const memberUpdate = (seenPicsChanged) ?
            {
                seenPics: newSeenPics,
                user,
            }
            : { user };

        const memberUpdatePromise = dbUpdateMulti(membership.PK, membership.SK, memberUpdate);
        updatePromises.push(memberUpdatePromise);
    }
    return updatePromises;
};