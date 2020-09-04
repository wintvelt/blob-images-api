// invoked from S3 Lambda trigger
import { newPhotoId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getUser, getMemberRole } from "../libs/dynamodb-lib-single";
import s3 from "../libs/s3-lib";
import { dbItem, dbCreate, dbCreateItem } from '../libs/dynamodb-create-lib';
import { getMembers } from '../libs/dynamodb-query-lib';

export const main = handler(async (event, context) => {
    const eventList = event.Records || [];
    const keyList = eventList.map(item => decodeURIComponent(item.s3.object.key));
    const keyListLength = keyList.length;

    let keyListByUser = {};
    for (let i = 0; i < keyListLength; i++) {
        const key = keyList[i];
        const cognitoId = key.split('/')[1];
        let userKeyList = keyListByUser[cognitoId];
        keyListByUser[cognitoId] = (userKeyList) ?
            [...userKeyList, key]
            : [key];
    }

    const userList = Object.keys(keyListByUser);
    const userListLength = userList.length;
    for (let i = 0; i < userListLength; i++) {
        const cognitoId = userList[i];
        const userId = 'U' + cognitoId;
        const userKeyList = keyListByUser[cognitoId];
        const user = await getUser(userId);

        const userKeyListLength = userKeyList.length;
        let createPromises = [];
        let groupAlbums = {};
        for (let j = 0; j < userKeyListLength; j++) {
            const key = userKeyList[j];
            const photoId = newPhotoId();
            const photoItem = dbItem({
                PK: 'PO' + photoId,
                SK: userId,
                url: key,
                owner: user,
                compAfterDate: photoId,
                compAfterType: userId,
            });
            createPromises.push(dbCreate(photoItem));
            const metadata = await s3.getMetadata({ Key: key });
            const customMeta = metadata.Metadata;
            if (customMeta) {
                const { groupid, albumid } = customMeta;
                if (groupid && albumid) {
                    const memberRole = await getMemberRole(userId, groupid);
                    const isGroupAdmin = (memberRole && memberRole === 'admin');
                    if (isGroupAdmin) {
                        const AlbumPhotoItem = {
                            PK: `GP${groupid}#${albumid}`,
                            SK: photoId,
                            photo: photoItem,
                            compAfterDate: photoId,
                            compAfterType: `${groupid}#${albumid}`,
                        };
                        createPromises.push(dbCreateItem(AlbumPhotoItem));
                        // add this photo groupAlbum list
                        let photolist = groupAlbums[groupId] || new Set();
                        photolist.add(`${albumid}#${photoId}`);
                        groupAlbums[groupid] = photolist;
                    }
                }
            };
        }
        // create updates for new photos in albums
        const groupKeys = Object.keys(groupAlbums);
        for (let i = 0; i < groupKeys.length; i++) {
            const groupKey = groupKeys[i];
            const newGroupAlbumPhotos = [...groupAlbums[groupKey]];
            const newPics = newGroupAlbumPhotos.map(photo => ({ albumPhoto: photo }));
            const members = await getMembers(groupKey);
            for (let j = 0; j < members.length; j++) {
                const member = members[j];
                if (member.PK.slice(2) !== userId) {
                    const oldSeenPics = member.seenPics || [];
                    const oldSeenPicsKeys = oldSeenPics.map(it => it.albumPhoto);
                    const newSeenPics = [
                        ...oldSeenPics,
                        ...newPics.filter(it => !oldSeenPicsKeys.includes(it.albumPhoto))
                    ];
                    const newPhotoUpdate = dynamoDb.update({
                        TableName: process.env.photoTable,
                        Key: {
                            PK: member.PK,
                            SK: member.SK
                        },
                        UpdateExpression: 'SET #s = :ns',
                        ExpressionAttributeNames: { '#s': 'seenPics' },
                        ExpressionAttributeValues: { ':ns': newSeenPics }
                    });
                    createPromises.push(newPhotoUpdate);
                }
            }

        }
        await Promise.all(createPromises);
    }

    return 'ok';
});