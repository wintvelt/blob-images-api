import handler, { getUserFromEvent } from "../libs/handler-lib";
import { getLoginUser } from "../libs/dynamodb-lib-user";
import { cleanRecord } from "../libs/dynamodb-lib-clean";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const cognitoId = event.requestContext.identity.cognitoIdentityId;
    // get user, and (potentially) update cognitoId and visit dates
    const user = await getLoginUser(userId, cognitoId);
    return cleanRecord(user);
});
