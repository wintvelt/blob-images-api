import handler, { getUserFromEvent } from "../libs/handler-lib";
import { getMembershipsAndInvites } from "../libs/dynamodb-lib-memberships";
import { cleanRecord } from "../libs/dynamodb-lib-clean";
import { now } from "../libs/helpers";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const today = now();
    const items = await getMembershipsAndInvites(userId);
    const memberships = items.map(item => cleanRecord({
        ...item,
        newPicsCount: (item.seenPics)?
            item.seenPics.filter(item => (!item.seenDate || item.seenDate === today)).length
            : 0,
    }));

    return memberships;
});