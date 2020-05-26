import { now, newGroupId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb, { getUser } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const cognitoId = event.requestContext.identity.cognitoIdentityId;
    const user = await getUser('U' + cognitoId);

    const newGroup = {
        id: newGroupId(),
        name: data.name,
        description: data.description,
        image: data.image,
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
                        PK: 'UM' + 'U' + cognitoId,
                        SK: newGroup.id,
                        role: 'admin',
                        user,
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