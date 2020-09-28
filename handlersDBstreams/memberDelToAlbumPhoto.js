import { dynamoDb } from 'blob-common/core/db';

export const removeMemberAlbumPhotos = async (memberKeys) => {
    const memberId = memberKeys.PK.slice(2);
    const groupId = memberKeys.SK;

    // get all user photos (keys only)
    const userPhotos = await dynamoDb.query({
        IndexName: process.env.photoIndex,
        KeyConditionExpression: '#sk = :sk and begins_with(PK, :po)',
        ProjectionExpression: 'PK, #sk',
        ExpressionAttributeNames: { '#sk': 'SK' },
        ExpressionAttributeValues: {
            ':sk': memberId,
            ':po': 'PO'
        },
    });
    const userPhotoKeys = userPhotos.Items.map(photoKey => photoKey.PK.slice(2));
    // get all albums in the group
    const groupAlbumResult = await dynamoDb.query({
        KeyConditionExpression: '#pk = :pk',
        ProjectionExpression: '#pk, #sk',
        ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
        ExpressionAttributeValues: { ':pk': 'GA' + groupId },
    });
    const groupAlbums = groupAlbumResult.Items;

    // get all photos in these albums in this group
    let groupPhotoPromises = [];
    const groupAlbumCount = groupAlbums.length;
    for (let i = 0; i < groupAlbumCount; i++) {
        const albumKey = groupAlbums[i];
        const albumPhotos = dynamoDb.query({
            KeyConditionExpression: '#pk = :pk',
            ProjectionExpression: '#pk, #sk',
            ExpressionAttributeNames: { '#pk': 'PK', '#sk': 'SK' },
            ExpressionAttributeValues: { ':pk': `GP${groupId}#${albumKey.SK}` },
        });
        groupPhotoPromises.push(albumPhotos);
    };
    const albumPhotoResults = await Promise.all(groupPhotoPromises);

    // delete all albumPhotos with a photoId owned by member
    let deletePromises = [];
    const albumCount = albumPhotoResults.length;
    for (let i = 0; i < albumCount; i++) {
        const albumPhotos = albumPhotoResults[i].Items;
        const albumPhotoCount = albumPhotos.length;
        for (let j = 0; j < albumPhotoCount; j++) {
            const albumPhoto = albumPhotos[j];
            if (userPhotoKeys.includes(albumPhoto.SK)) {
                deletePromises.push(dynamoDb.delete({
                    Key: { PK: albumPhoto.PK, SK: albumPhoto.SK }
                }));
            }
        }
    }

    console.log(`${deletePromises.length} photos removed from ${groupAlbumCount} albums`);

    return deletePromises;
};