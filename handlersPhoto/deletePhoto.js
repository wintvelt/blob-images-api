import handler from "../libs/handler-lib";
import dynamoDb, { getMemberships } from "../libs/dynamodb-lib";
import s3 from '../libs/s3-lib';

const groupUpdate = (photoUrl) => (group) => {
    return dynamoDb.update({
        TableName: process.env.photoTable,
        Key: {
            PK: 'GBbase',
            SK: group.SK
        },
        UpdateExpression: "REMOVE #image, #imageUrl",
        ConditionExpression: '#imageUrl = :photoUrl',
        ExpressionAttributeNames: {
            '#image': 'image',
            '#imageUrl': 'imageUrl',
        },
        ExpressionAttributeValues: {
            ":photoUrl": photoUrl,
        },
    });
};
const albumUpdate = (photoUrl) => (album) => {
    return dynamoDb.update({
        TableName: process.env.photoTable,
        Key: {
            PK: album.PK,
            SK: album.SK
        },
        UpdateExpression: "REMOVE #image, #imageUrl",
        ConditionExpression: '#imageUrl = :photoUrl',
        ExpressionAttributeNames: {
            '#image': 'image',
            '#imageUrl': 'imageUrl',
        },
        ExpressionAttributeValues: {
            ":photoUrl": photoUrl,
        },
    });
};
const albumPhotoUpdate = (photoId) => (album) => {
    return dynamoDb.delete({
        TableName: process.env.photoTable,
        Key: {
            PK: `GP${album.group.id}#${album.SK}`,
            SK: photoId
        },
    });
};
const userUpdate = (photoUrl) => (userId) => ({
    TableName: process.env.photoTable,
    Key: {
        PK: 'UBbase',
        SK: userId
    },
    UpdateExpression: "REMOVE #avatar",
    ConditionExpression: '#avatar = :photoUrl',
    ExpressionAttributeNames: {
        '#avatar': 'avatar',
    },
    ExpressionAttributeValues: {
        ":photoUrl": photoUrl,
    },
});


export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;

    const photoParams = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'PO' + event.pathParameters.id,
            SK: userId,
        },
        ReturnValues: "ALL_OLD"
    };

    const result = await dynamoDb.delete(photoParams);
    if (!result.Attributes) {
        throw new Error("Photo not found.");
    };
    const photoUrl = result.Attributes.url;

    const groups = await getMemberships(userId);
    const groupAlbums = await Promise.all(groups.map(group => dynamoDb.query({
        TableName: process.env.photoTable,
        KeyConditionExpression: "#PK = :group",
        ExpressionAttributeNames: {
            '#PK': 'PK',
        },
        ExpressionAttributeValues: {
            ":group": `GA${group.SK}`,
        },
    })));
    const albums = groupAlbums.reduce((acc, alb) => ([...acc, ...alb.Items]), []);
    console.log(albums);
    try {
        await Promise.all([
            ...groups.filter(group => (group.imageUrl === photoUrl)).map(groupUpdate(photoUrl)),
            ...albums.filter(album => (album.imageUrl === photoUrl)).map(albumUpdate(photoUrl)),
            ...albums.map(albumPhotoUpdate(result.Attributes.PK.slice(2))),
            dynamoDb.update(userUpdate(photoUrl)(userId)),
            s3.delete({
                Key: photoUrl
            }),
        ]);
    } catch (error) {
        console.log(error);
    }

    return 'ok';
});
