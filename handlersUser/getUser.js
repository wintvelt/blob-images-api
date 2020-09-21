import { handler, getUserFromEvent } from "blob-common/core/handler";
import { cleanRecord } from "blob-common/core/dbClean";
import { getLoginUser } from "../libs/dynamodb-lib-user";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const cognitoId = event.requestContext.identity.cognitoIdentityId;
    // get user, and (potentially) update cognitoId and visit dates
    const user = await getLoginUser(userId, cognitoId);
    return cleanRecord(user);
});
