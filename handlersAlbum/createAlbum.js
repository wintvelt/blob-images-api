import { now, RND, newAlbumId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb, { getMember } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const groupId = event.pathParameters.id;
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const membership = await getMember(userId, groupId);
    if (!membership.role === 'admin') throw new Error('Not authorized to create album');

    const newAlbum = {
        id: newAlbumId(),
        name: data.name,
        image: data.image,
        imageUrl: data.image && data.image.image,
        group: membership.group,
    };
    const params = {
        TableName: process.env.photoTable,
        Item: {
            PK: 'GA' + groupId,
            SK: newAlbum.id,
            name: newAlbum.name,
            image: newAlbum.image,
            imageUrl: newAlbum.imageUrl,
            group: membership.group,
            comp: 'dummy',
            RND: RND(),
            createdAt: now(),
        }
    };

    await dynamoDb.put(params);

    return params.Item;
});