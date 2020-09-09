import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getMemberRole, getMember } from "../libs/dynamodb-lib-single";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const data = JSON.parse(event.body);
    const { memberId, newRole } = data;

    const userRole = await getMemberRole(userId, groupId);
    if (!userRole === 'admin') throw new Error('not authorized to update membership');
    if (newRole !== 'admin' && newRole !== 'guest') throw new Error('invalid new role');

    const memberToUpdate = await getMember(memberId, groupId);
    if (!memberToUpdate) throw new Error('member not found in this group');

    const result = await dynamoDb.update({
        TableName: process.env.photoTable,
        Key: {
            PK: 'UM' + memberId,
            SK: groupId,
        },
        UpdateExpression: "SET #r = :r",
        ExpressionAttributeNames: {
            '#r': 'role'
        },
        ExpressionAttributeValues: {
            ":r": newRole
        },
        ReturnValues: "ALL_NEW"
    });
    if (!result.Attributes) throw new Error('membership update failed');
    return 'ok';
});
