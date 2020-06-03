import handler from "../libs/handler-lib";
import dynamoDb, { getMemberRole } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const albumId = event.pathParameters.albumid;

    const memberRole = await getMemberRole(userId, groupId);
    if (!memberRole) throw new Error('not a member of this group');

    const params = {
        TableName: process.env.photoTable,
        KeyConditionExpression: "#a = :groupAlbum",
        ExpressionAttributeNames: {
            '#a': 'PK',
        },
        ExpressionAttributeValues: {
            ":groupAlbum": `GP${groupId}#${albumId}`,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        throw new Error("photos retrieval failed.");
    };
    const albumPhotos = items.map(item => ({
        ...item.photo,
        id: item.photo.PK.slice(2)
    }));
    return albumPhotos;
});
