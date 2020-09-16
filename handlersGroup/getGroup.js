import handler, { getUserFromEvent } from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const groupId = event.pathParameters.id;
    if (groupId === 'new') return '';

    const result = await dynamoDb.get({
        TableName: process.env.photoTable,
        Key: {
            PK: 'UM' + userId,
            SK: groupId
        }
    });
    const membership = result.Item;
    if (!membership || membership.status === 'invite') throw new Error('not a member of this group');
    const userRole = membership.role;

    return { ...membership.group, userRole };
});
