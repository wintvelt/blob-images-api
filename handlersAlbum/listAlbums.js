import handler from "../libs/handler-lib";
import { getMember } from "../libs/dynamodb-lib-single";
import { listGroupAlbums } from "../libs/dynamodb-query-lib";
import { now } from "../libs/helpers";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const membership = await getMember(userId, groupId);
    if (!membership || membership.status === 'invite') throw new Error('no access to group');

    const seenPics = membership.seenPics || [];
    const today = now();
    const albums = await listGroupAlbums(groupId, membership.role);
    const albumsWithNewPicsCount = albums.map(album => {
        const newPicsCount = seenPics.filter(pic => (
            pic.albumPhoto.split('#')[0] === album.SK
            && (!pic.seenDate || pic.seenDate === today)
        )).length;
        return { ...album, newPicsCount };
    });

    return albumsWithNewPicsCount;
});