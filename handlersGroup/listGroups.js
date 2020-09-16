import handler, { getUserFromEvent } from "../libs/handler-lib";
import { getMembershipsAndInvites } from "../libs/dynamodb-lib-memberships";
import { now } from "../libs/helpers";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const today = now();
    const items = await getMembershipsAndInvites(userId);
    const groups = items.map(item => ({
        ...item.group,
        userRole: item.role,
        newPicsCount: (item.seenPics) ?
            item.seenPics.filter(item => (!item.seenDate || item.seenDate === today)).length
            : 0,
        createdAt: item.createdAt,
    }));

    return groups;
});