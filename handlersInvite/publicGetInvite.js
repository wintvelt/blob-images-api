import { handler, getUserFromEvent } from "blob-common/core/handler";
import { getInvite } from './inviteHelpers';

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const inviteId = event.pathParameters.id;
    const invite = await getInvite(userId, inviteId);

    // Return the retrieved item
    return invite;
});
