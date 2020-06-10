import handler from "../libs/handler-lib";
import { getMemberRole } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    if (groupId === 'new') return false;

    const membership = await getMemberRole(userId, groupId);
    return !!membership;
});
