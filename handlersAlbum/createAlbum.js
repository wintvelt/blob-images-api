import { newAlbumId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import { getMember } from "../libs/dynamodb-lib";
import sanitize from 'sanitize-html';
import { dbCreateItem } from '../libs/dynamodb-create-lib';

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const groupId = event.pathParameters.id;
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const membership = await getMember(userId, groupId);
    if (!membership.role === 'admin') throw new Error('Not authorized to create album');

    const newAlbum = {
        id: newAlbumId(),
        name: sanitize(data.name),
        image: data.image,
        imageUrl: data.image && data.image.image,
        group: membership.group,
    };
    const albumItem = {
        PK: 'GA' + groupId,
        SK: newAlbum.id,
        name: newAlbum.name,
        image: newAlbum.image,
        imageUrl: newAlbum.imageUrl,
        group: membership.group,
        compAfterDate: `${groupId}#${newAlbum.id}`,
    };

    const result = await dbCreateItem(albumItem);

    return result;
});