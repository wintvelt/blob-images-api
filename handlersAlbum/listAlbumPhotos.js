import handler from "../libs/handler-lib";
import { getMemberRole, listAlbumPhotos } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const albumId = event.pathParameters.albumid;

    const memberRole = await getMemberRole(userId, groupId);
    if (!memberRole) throw new Error('not a member of this group');

    const albumPhotos = await listAlbumPhotos(groupId, albumId);
    return albumPhotos;
});