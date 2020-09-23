import { dynamoDb, dbUpdate } from 'blob-common/core/db';

const getAlbumsByGroup = async (groupId) => {
    const params = {
        KeyConditionExpression: "#g = :g",
        ExpressionAttributeNames: {
            '#g': 'PK',
        },
        ExpressionAttributeValues: {
            ":g": 'GA' + groupId,
        },
    };
    const result = await dynamoDb.query(params);
    const items = result.Items;
    return items || [];
};

export const updateAlbumGroup = async (group) => {
    const groupId = group.SK;
    const albumsToUpdate = await getAlbumsByGroup(groupId);
    const albumsCount = albumsToUpdate.length;
    let updatePromises = [];
    for (let i = 0; i < albumsCount; i++) {
        const album = albumsToUpdate[i];
        const albumUpdatePromise = dbUpdate(album.PK, album.SK, 'group', group);
        updatePromises.push(albumUpdatePromise);
    }
    return updatePromises;
};