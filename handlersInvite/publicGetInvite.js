import handler from "../libs/handler-lib";
import { getInvite } from './inviteHelpers';

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const inviteId = event.pathParameters.id;
    const invite = await getInvite(userId, inviteId);

    // Return the retrieved item
    return invite;
});
