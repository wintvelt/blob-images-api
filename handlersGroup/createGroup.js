import { now, newGroupId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb, { getUser } from "../libs/dynamodb-lib";
import sanitize from 'sanitize-html';

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const user = await getUser(userId);

    const newGroup = {
        id: newGroupId(),
        name: sanitize(data.name),
        description: sanitize(data.description),
        image: data.image,
        imageUrl: data.image && data.image.image,
    };

    const params = {
        TransactItems: [
            {
                Put: {
                    TableName: process.env.photoTable,
                    Item: {
                        PK: 'GBbase',
                        SK: newGroup.id,
                        name: newGroup.name,
                        description: newGroup.description,
                        image: newGroup.image,
                        imageUrl: newGroup.imageUrl,
                        comp: 'dummy',
                        RND: 'GROUP',
                        createdAt: now(),
                    }
                }
            },
            {
                Put: {
                    TableName: process.env.photoTable,
                    Item: {
                        PK: 'UM' + userId,
                        SK: newGroup.id,
                        role: 'admin',
                        user,
                        group: newGroup,
                        comp: 'admin',
                        RND: 'GROUP',
                        createdAt: now(),
                    }
                }
            },
        ]
    };

    await dynamoDb.transact(params);

    return params.TransactItems[0].Put.Item;
});