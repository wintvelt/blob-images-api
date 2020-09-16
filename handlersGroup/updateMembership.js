import handler, { getUserFromEvent } from "../libs/handler-lib";
import { dbUpdate } from "../libs/dynamodb-lib";
import { getMemberRole, getMember } from "../libs/dynamodb-lib-single";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const groupId = event.pathParameters.id;
    const memberId = event.pathParameters.memberid;
    if (!event.body) throw new Error('bad request - update missing');
    const data = JSON.parse(event.body);
    const { newRole } = data;

    const userRole = await getMemberRole(userId, groupId);
    if (!userRole === 'admin') throw new Error('not authorized to update membership');
    if (newRole !== 'admin' && newRole !== 'guest') throw new Error('invalid new role');

    const memberToUpdate = await getMember(memberId, groupId);
    if (!memberToUpdate) throw new Error('member not found in this group');

    const result = await dbUpdate('UM'+memberId, groupId, 'role', newRole);
    if (!result.Attributes) throw new Error('membership update failed');
    return 'ok';
});
