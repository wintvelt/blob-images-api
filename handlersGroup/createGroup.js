import { newGroupId } from '../libs/helpers';
import handler, { getUserFromEvent } from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getPhotoById } from "../libs/dynamodb-lib-single";
import { getUser } from "../libs/dynamodb-lib-user";
import sanitize from 'sanitize-html';
import { dbItem } from '../libs/dynamodb-create-lib';
import { cleanRecord } from '../libs/dynamodb-lib-clean';

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const data = JSON.parse(event.body);
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

    return cleanRecord(params.TransactItems[0].Put.Item);
});