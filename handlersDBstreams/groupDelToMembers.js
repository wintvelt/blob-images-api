import { expireDate, now } from 'blob-common/core/date';
import { dynamoDb } from 'blob-common/core/db';
import { mailToMembers } from '../libs/memberMail-lib';

export const delGroupMembers = async (Keys) => {
    const groupId = Keys.SK;
    const membersQuery = await dynamoDb.query({
        IndexName: process.env.photoIndex,
        KeyConditionExpression: '#sk = :sk and begins_with(PK, :um)',
        ExpressionAttributeNames: { '#sk': 'SK' },
        ExpressionAttributeValues: { ':sk': groupId, ':um': 'UM' }
    });
    const allMembers = membersQuery.Items || [];
    const today = now();
    const members = allMembers.filter(item => item.status !== 'invite' || expireDate(item.createdAt) >= today);

    let memberDelPromises = [];

    for (let i = 0; i < members.length; i++) {
        const mem = members[i];
        memberDelPromises.push(dynamoDb.delete({
            Key: {
                PK: mem.PK,
                SK: mem.SK
            }
        }));
    };

    const mailPromise = mailToMembers(members);
    if (mailPromise) memberDelPromises.push(mailPromise);

    console.log(`${memberDelPromises.length} members/ invites deleted`);
    console.log(`${memberDelPromises.length} members/ invites also informed by email`);
    return memberDelPromises;
};