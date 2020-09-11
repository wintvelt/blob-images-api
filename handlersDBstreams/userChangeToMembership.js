import { getMemberships } from '../libs/dynamodb-query-lib';
import dynamoDb from '../libs/dynamodb-lib';
import { cleanRecord } from '../libs/dynamodb-lib-clean';

export const updateMemberUser = async (newUser) => {
    const user = cleanRecord(newUser);
    const userId = user.SK;
    const today = user.visitDateLast;
    const membershipsToUpdate = await getMemberships(userId);
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
                UpdateExpression: 'SET #sp = :sp, #u = :u',
                ExpressionAttributeNames: { '#sp': 'seenPics', '#u': 'user' },
                ExpressionAttributeValues: { ':sp': newSeenPics, ':u': user }
            }
            : {
                UpdateExpression: 'SET #u = :u',
                ExpressionAttributeNames: { '#u': 'user' },
                ExpressionAttributeValues: { ':u': user }
            };

        const memberUpdatePromise = dynamoDb.update({
            TableName: process.env.photoTable,
            Key: {
                PK: membership.PK,
                SK: membership.SK
            },
            ...memberUpdate
        });
        updatePromises.push(memberUpdatePromise);
    }
    await Promise.all(updatePromises);
};