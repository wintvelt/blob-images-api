import { now, RND } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const cognitoId = event.requestContext.identity.cognitoIdentityId;

    const params = {
        TableName: process.env.photoTable,
        Item: {
            PK: 'UBbase',
            SK: 'U' + cognitoId,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            comp: 'confirmed',
            RND: RND(),
            createdAt: now(),
        }
    };

    await dynamoDb.put(params);

    return params.Item;
});