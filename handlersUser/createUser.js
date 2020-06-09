import { now } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import sanitize from 'sanitize-html';

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const cognitoId = event.requestContext.identity.cognitoIdentityId;

    const params = {
        TableName: process.env.photoTable,
        Item: {
            PK: 'UBbase',
            SK: 'U' + cognitoId,
            name: sanitize(data.name),
            email: data.email.toLowerCase(),
            avatar: data.avatar,
            comp: data.email.toLowerCase(),
            RND: 'USER',
            createdAt: now(),
        }
    };

    await dynamoDb.put(params);

    return params.Item;
});