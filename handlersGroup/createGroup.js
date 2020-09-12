import { newGroupId } from '../libs/helpers';
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getPhotoById, getUser } from "../libs/dynamodb-lib-single";
import sanitize from 'sanitize-html';
import { dbItem } from '../libs/dynamodb-create-lib';

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const user = await getUser(userId);
    const groupId = newGroupId();

    let newGroup = dbItem({
        PK: 'GBbase',
        SK: groupId,
        name: sanitize(data.name || ''),
        description: sanitize(data.description || ''),
    });
    if (data.photoId) {
        const photo = await getPhotoById(data.photoId, userId);

        if (photo) {
            newGroup.photoId = data.photoId;
            newGroup.photo = photo;
        }
    }

    const params = {
        TransactItems: [
            {
                Put: {
                    TableName: process.env.photoTable,
                    Item: newGroup
                }
            },
            {
                Put: {
                    TableName: process.env.photoTable,
                    Item: dbItem({
                        PK: 'UM' + userId,
                        SK: groupId,
                        role: 'admin',
                        user,
                        group: newGroup,
                    })
                }
            },
        ]
    };

    await dynamoDb.transact(params);

    return params.TransactItems[0].Put.Item;
});