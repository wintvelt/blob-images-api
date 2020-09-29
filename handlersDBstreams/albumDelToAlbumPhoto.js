import { dynamoDb } from 'blob-common/core/db';

export const removeAlbumPhotos = async (Keys) => {
    const groupId = Keys.PK.slice(2);
    const albumId = Keys.SK;

    // remove all albumPhotos
    let deletePromises = [];
    const result = await dynamoDb.query({
        KeyConditionExpression: '#pk = :pk',
        ProjectionExpression: '#pk, #sk',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: {
            ':pk': `GP${groupId}#${albumId}`
        },
    });
    const albumPhotos = result.Items || [];

    for (let i = 0; i < albumPhotos.length; i++) {
        const albumPhoto = albumPhotos[i];
        deletePromises.push(dynamoDb.delete({
            Key: { PK: albumPhoto.PK, SK: albumPhoto.SK }
        }));
    }

    console.log(`${deletePromises.length} albumPhotos removed from deleted album`);

    return deletePromises;
};