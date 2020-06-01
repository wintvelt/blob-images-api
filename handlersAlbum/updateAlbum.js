import handler from "../libs/handler-lib";
import dynamoDb, { getMemberRole } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const albumId = event.pathParameters.albumid;
    const data = JSON.parse(event.body);

    const memberRole = await getMemberRole(userId, groupId);
    if (memberRole !== 'admin') throw new Error('album update not allowed');

    const newAlbum = {
        id: albumId,
        name: data.name,
        image: data.image || null,
        imageUrl: (data.image) ? data.image.image : null,
    };

    const albumParams = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'GB' + groupId,
            SK: albumId,
        },
        UpdateExpression: "SET #name = :name, #img = :img, #imgUrl = :imgUrl",
        ExpressionAttributeNames: {
            '#name': 'name',
            '#img': 'image',
            '#imgUrl': 'imageUrl',
        },
        ExpressionAttributeValues: {
            ":name": newAlbum.name,
            ':img': newAlbum.image,
            ':imgUrl': newAlbum.imageUrl,
        },
        ReturnValues: "NONE"
    };
    await dynamoDb.update(albumParams);

    return { status: true };
});