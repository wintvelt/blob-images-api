import handler from "../libs/handler-lib";
import { getMemberships } from "../libs/dynamodb-query-lib";
import { now } from "../libs/helpers";

export const main = handler(async (event, context) => {
    const items = await getMemberships('U' + event.requestContext.identity.cognitoIdentityId);
    const today = now();
    const groups = items.map(item => ({
        id: item.SK,
        member: item.member,
        group: item.group,
        newPicsCount: (item.seenPics)?
            item.seenPics.filter(item => (!item.seenDate || item.seenDate === today)).length
            : 0,
        role: item.role,
        date: item.createdAt,
    }));

    return groups;
});