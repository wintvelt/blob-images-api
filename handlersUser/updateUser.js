import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { listPhotoPublications } from "../libs/dynamodb-query-lib";
import { listPhotos } from "../libs/dynamodb-lib-photo";

const memberUpdate = (PK, SK, key, newUser) => (dynamoDb.update({
    TableName: process.env.photoTable,
    Key: {
        PK,
        SK,
    },
    UpdateExpression: "SET #user = :newUser",
    ExpressionAttributeNames: {
        '#user': key,
    },
    ExpressionAttributeValues: {
        ":newUser": newUser,
    },
    ReturnValues: "ALL_NEW"
}));

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const newUser = {
        name: data.name || null,
        avatar: data.avatar || null
    };
    const userParams = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: userId,
        },
        UpdateExpression: "SET #name = :name, avatar = :avatar",
        ExpressionAttributeNames: {
            '#name': 'name',
        },
        ExpressionAttributeValues: {
            ":name": newUser.name,
            ":avatar": newUser.avatar,
        },
        ReturnValues: "ALL_NEW"
    };

    let pubUpdates = [];
    const photos = await listPhotos(userId);
    for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const photoId = photo.PK.slice(2);
        const newPhoto = { ...photo, owner: newUser };
        const publications = await listPhotoPublications(photoId);
        for (let j = 0; j < publications.length; j++) {
            const pub = publications[j];
            const pubUpdate = memberUpdate(pub.PK, pub.SK, 'photo', newPhoto);
            pubUpdates.push(pubUpdate);
        }
    }

    await Promise.all([
        dynamoDb.update(userParams),
        ...pubUpdates
    ]);

    return { status: true };
});