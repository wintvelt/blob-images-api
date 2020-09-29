import { dynamoDb } from 'blob-common/core/db';

export const delUserMemberships = async (Keys) => {
    const userId = Keys.SK;

    // also get all expired invites
    const membershipsResult = await dynamoDb.query({
        KeyConditionExpression: '#pk = :pk',
        ProjectionExpression: '#pk, #sk',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: { ':pk': 'UM' + userId }
    });
    const memberships = membershipsResult.Items || [];
    const membershipsCount = memberships.length;

    let delPromises = [];

    for (let i = 0; i < membershipsCount; i++) {
        const mem = memberships[i];
        delPromises.push(dynamoDb.delete({
            Key: {
                PK: mem.PK,
                SK: mem.SK
            }
        }));
    }

    console.log(`deleted ${delPromises.length} memberships of deleted user`);
    return delPromises;
};