import { dbUpdateMulti, dynamoDb } from 'blob-common/core/db';
import { listPhotoPublications } from '../libs/dynamodb-lib-photo';

export const clearGroupAlbumCover = async (groupPhotoKeys) => {
    const photoId = groupPhotoKeys.SK;
    const groupId = groupPhotoKeys.PK.split('#')[0].slice(2);
    const albumId = groupPhotoKeys.PK.split('#')[1];

    let deletePromises = [];
    const albumKey = { PK: 'GA' + groupId, SK: albumId };
    const groupKey = { PK: 'GBbase', SK: groupId };
    const emptyCover = { photoId: '', photo: '' };

    // remove as albumcover if needed
    const albumResult = await dynamoDb.get({ Key: albumKey });
    const album = albumResult.Item;
    const isAlbumCover = (album.photoId === photoId);
    if (isAlbumCover) deletePromises.push(dbUpdateMulti(albumKey.PK, albumKey.SK, emptyCover));

    // check if photo is still in group
    const publications = await listPhotoPublications(photoId);
    const isStillInGroup = publications.find(pub => (pub.PK.split('#')[0].slice(2) === groupId));
    if (!isStillInGroup) {
        // check if is photo is cover
        const groupResult = await dynamoDb.get({ Key: groupKey });
        const group = groupResult.Item;
        // if so, remove as cover from group
        if (group && group.photoId === photoId) {
            deletePromises.push(dbUpdateMulti(group.PK, group.SK, emptyCover));
        }
    }

    return deletePromises;
};