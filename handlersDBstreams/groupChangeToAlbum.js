import { dynamoDb, dbUpdate } from 'blob-common/core/db';
import { cleanRecord } from 'blob-common/core/dbClean';


const getAlbumsByGroup = async (groupId) => {
    const params = {
        TableName: process.env.photoTable,
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

export const updateAlbumGroup = async (newGroup) => {
    const group = cleanRecord(newGroup);
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