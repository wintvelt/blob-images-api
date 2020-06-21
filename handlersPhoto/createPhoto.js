// invoked from S3 Lambda trigger
import { newPhotoId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import { getUser } from "../libs/dynamodb-lib";
import { dbCreateItem } from '../libs/dynamodb-create-lib';

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
            const photoItem = {
                PK: 'PO' + photoId,
                SK: userId,
                url: key,
                owner: user,
                compAfterDate: photoId,
                compAfterType: userId,
            };
            createPromises.push(dbCreateItem(photoItem));
        }
        await Promise.all(createPromises);
    }

    return 'ok';
});