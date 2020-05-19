// invoked from S3 Lambda trigger
import { now, RND, newPhotoId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const eventList = event.Records || [];
    const keyList = eventList.map(item => item.s3.object.key);

    const keyListLength = keyList.length;
    for (let i = 0; i < keyListLength; i++) {
        const key = keyList[i];
        const cognitoId = decodeURIComponent(key).split('/')[1];
        const params = {
            TableName: process.env.photoTable,
            Item: {
                PK: newPhotoId(),
                SK: 'U' + cognitoId,
                url: key,
                RND: RND(),
                createdAt: now(),
            }
        };
        await dynamoDb.put(params);
    }

    return 'ok';
});