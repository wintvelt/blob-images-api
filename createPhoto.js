import * as uuid from "uuid";
import { now, RND } from './libs/helpers';
import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    // Request body is passed in as a JSON encoded string in 'event.body'
    const data = JSON.parse(event.body);

    const params = {
        TableName: process.env.photoTable,
        Item: {
            PK: 'P' + uuid.v1(),
            SK: 'U' + event.requestContext.identity.cognitoIdentityId,
            title: data.title,
            url: data.url,
            RND: RND(),
            createdAt: now(),
        }
    };

    await dynamoDb.put(params);

    return params.Item;
});