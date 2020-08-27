import handler from "../libs/handler-lib";
import { getMemberRole } from "../libs/dynamodb-lib";
import { getMembersAndInvites } from "../libs/dynamodb-query-lib";

const compareMembers = (a, b) => {
    if (a.status && a.status === 'invite') {
        if (b.status && b.status === 'invite') {
            if (a.user.name.toLowerCase() > b.user.name.toLowerCase()) return 1;
            if (a.user.name.toLowerCase() < b.user.name.toLowerCase()) return -1;
            return 0;
        } else return 1;
    } else {
        if (b.status && b.status === 'invite') {
            return -1;
        } else {
            if (a.user.name.toLowerCase() > b.user.name.toLowerCase()) return 1;
            if (a.user.name.toLowerCase() < b.user.name.toLowerCase()) return -1;
            return 0;
        }
    }
};

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const groupRole = await getMemberRole(userId, groupId);
    if (!groupRole) throw new Error('no access to group');

    const members = await getMembersAndInvites(groupId);

    return members.sort(compareMembers);
});