// invoked from S3 Lambda trigger
import { newPhotoId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import { getUser, getMemberRole } from "../libs/dynamodb-lib-single";
import s3 from "../libs/s3-lib";
import { dbItem, dbCreate, dbCreateItem } from '../libs/dynamodb-create-lib';

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
                    }
                }
            };
        }
        await Promise.all(createPromises);
    }

    return 'ok';
});