import { now, RND, newAlbumId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb, { getMemberRole } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const groupId = event.pathParameters.groupId;
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const memberRole = await getMemberRole(userId, groupId);
    if (!memberRole === 'admin') throw new Error('Not authorized to create album');

    const newAlbum = {
        id: newAlbumId(),
        name: data.name,
        image: data.image,
        imageUrl: data.image && data.image.image,
    };
    const params = {
        TableName: process.env.photoTable,
        Item: {
            PK: 'GA' + groupId,
            SK: newAlbum.id,
            name: newAlbum.name,
            image: newAlbum.image,
            imageUrl: newAlbum.imageUrl,
            comp: 'dummy',
            RND: RND(),
            createdAt: now(),
        }
    };

    await dynamoDb.put(params);

    return params.Item;
});