import { now, RND, newPhotoId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);

    const params = {
        TableName: process.env.photoTable,
        Item: {
            PK: newPhotoId(),
            SK: 'U' + event.requestContext.identity.cognitoIdentityId,
            title: data.title,
            description: data.description,
            url: data.url,
            RND: RND(),
            createdAt: now(),
        }
    };

    await dynamoDb.put(params);

    return params.Item;
});