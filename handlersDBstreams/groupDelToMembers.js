import { dynamoDb } from 'blob-common/core/db';

export const delGroupMembers = async (Keys) => {
    const groupId = Keys.SK;
    const membersQuery = await dynamoDb.query({
        IndexName: process.env.photoIndex,
        KeyConditionExpression: '#sk = :sk and begins_with(PK, :um)',
        ExpressionAttributeNames: { '#sk': 'SK' },
        ExpressionAttributeValues: { ':sk': groupId, ':mem': 'UM' }
    });
    const allMembers = membersQuery.Items;
    let memberDelPromises = [];

    for (let i = 0; i < allMembers.length; i++) {
        const mem = allMembers[i];
        memberDelPromises.push(dynamoDb.delete({
            Key: {
                PK: mem.PK,
                SK: mem.SK
            }
        }));
    }

    console.log(`${memberDelPromises.length} members/ invites deleted`);
    return memberDelPromises;
};