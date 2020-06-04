import handler from "../libs/handler-lib";
import { getMembers, getMemberRole } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const groupRole = await getMemberRole(userId, groupId);
    if (!groupRole) throw new Error('no access to group');

    const members = await getMembers(groupId);

    return members;
});