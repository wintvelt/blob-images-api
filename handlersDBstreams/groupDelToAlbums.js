import { dynamoDb } from 'blob-common/core/db';

export const delGroupAlbums = async (Keys) => {
    const groupId = Keys.SK;
    const albumsQuery = await dynamoDb.query({
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: { '#pk': 'PK' },
        ExpressionAttributeValues: { ':pk': 'GA' + groupId }
    });
    const albums = albumsQuery.Items;
    let albumDelPromises = [];

    for (let i = 0; i < albums.length; i++) {
        const album = albums[i];
        albumDelPromises.push(dynamoDb.delete({
            Key: {
                PK: album.PK,
                SK: album.SK
            }
        }));
    }

    console.log(`${albumDelPromises.length} albums deleted from deleted group`);
    return albumDelPromises;
};