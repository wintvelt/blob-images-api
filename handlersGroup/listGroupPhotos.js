import handler from "../libs/handler-lib";
import { getMemberRole } from "../libs/dynamodb-lib";
import { listGroupAlbums, listAlbumPhotos } from "../libs/dynamodb-query-lib";

export const main = handler(async (event, context) => {
    const groupId = event.pathParameters.id;
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupRole = await getMemberRole(userId, groupId);
    if (!groupRole) throw new Error('no access to this group');

    const groupAlbums = await listGroupAlbums(groupId, groupRole);
    const groupAlbumPhotos = await Promise.all(groupAlbums.map(album => {
        return listAlbumPhotos(groupId, album.id);
    }));
    const groupPhotos = groupAlbumPhotos.reduce((acc, photolist, i) => (
        [...acc, ...photolist.map(photo => ({...photo, album: groupAlbums[i]}))]
    ), []);

    return groupPhotos;
});
