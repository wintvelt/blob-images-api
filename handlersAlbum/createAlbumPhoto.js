import handler from "../libs/handler-lib";
import dynamoDb, { getMemberRole, getPhoto, listPhotos } from "../libs/dynamodb-lib";
import { now } from '../libs/helpers';

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const albumId = event.pathParameters.albumid;
    const data = JSON.parse(event.body);
    const { photoId, filename } = data;

    const memberRole = await getMemberRole(userId, groupId);
    if (!memberRole) throw new Error('not a member of this group');
    const userIsAdmin = (memberRole === 'admin');
    if (!userIsAdmin) throw new Error('not authorized to add photos');

    let photo;
    if (photoId) {
        photo = await getPhoto(photoId);
    } else {
        const photos = await listPhotos(userId);
        photo = photos.find(p => p.image.includes(filename));
    }
    if (!photo) throw new Error('photo not found');

    const params = {
        TableName: process.env.photoTable,
        Item: {
            PK: `GP${groupId}#${albumId}`,
            SK: photo.PK.slice(2),
            createdAt: now(),
            photo,
        }
    };
    await dynamoDb.put(params);

    return params.Item;
});
