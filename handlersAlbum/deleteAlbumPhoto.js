import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getMemberRole } from "../libs/dynamodb-lib-single";
import { getMembers } from "../libs/dynamodb-query-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const albumId = event.pathParameters.albumid;
    const photoId = event.pathParameters.photoid;

    const memberRole = await getMemberRole(userId, groupId);
    if (!memberRole) throw new Error('not a member of this group');
    const userIsAdmin = (memberRole === 'admin');
    if (!userIsAdmin) throw new Error('not authorized to remove photo from album');

    const result = await dynamoDb.delete({
        TableName: process.env.photoTable,
        Key: {
            PK: `GP${groupId}#${albumId}`,
            SK: photoId,
        },
        ReturnValues: 'ALL_OLD'
    });
    console.log(result);
    if (!result.Attributes) throw new Error('could not remove photo from album');

    // remove from other users unseen list
    const members = await getMembers(groupId);
    let seenPicsPromises = [];
    const picKey = `${albumId}#${photoId}`;
    for (let j = 0; j < members.length; j++) {
        const member = members[j];
        if (member.PK.slice(2) !== userId) {
            const oldSeenPics = member.seenPics || [];
            const newSeenPics = oldSeenPics.filter(pic => (pic.albumPhoto !== picKey));
            const delPhotoUpdate = dynamoDb.update({
                TableName: process.env.photoTable,
                Key: {
                    PK: member.PK,
                    SK: member.SK
                },
                UpdateExpression: 'SET #s = :ns',
                ExpressionAttributeNames: { '#s': 'seenPics' },
                ExpressionAttributeValues: { ':ns': newSeenPics }
            });
            seenPicsPromises.push(delPhotoUpdate);
        }
    }
    await Promise.all(seenPicsPromises);

    return 'ok';
});
