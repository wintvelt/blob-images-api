import handler from "../libs/handler-lib";
import dynamoDb, { getMemberRole } from "../libs/dynamodb-lib";

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

    return 'ok';
});
