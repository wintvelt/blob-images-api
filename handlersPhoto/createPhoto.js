// invoked from S3 Lambda trigger
import { now, RND, newPhotoId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

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
        const userKeyList = keyListByUser[cognitoId];
        const userParams = {
            TableName: process.env.photoTable,
            Key: {
                PK: 'UBbase',
                SK: 'U' + cognitoId,
            }
        };
        const result = await dynamoDb.get(userParams);
        const user = result.Item;

        const userKeyListLength = userKeyList.length;
        for (let j = 0; j < userKeyListLength; j++) {
            const key = userKeyList[j];
            const photoParams = {
                TableName: process.env.photoTable,
                Item: {
                    PK: 'PO' + newPhotoId(),
                    SK: 'U' + cognitoId,
                    url: key,
                    RND: RND(),
                    createdAt: now(),
                    owner: user.name,
                }
            };
            await dynamoDb.put(photoParams);
        }
    }

    return 'ok';
});