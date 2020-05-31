import handler from "../libs/handler-lib";
import { listGroupAlbums, checkUser } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.groupId;
    const userHasAccess = await checkUser(userId, groupId);
    if (!userHasAccess) throw new Error('no access to group');

    const albums = await listGroupAlbums(groupId);
    return albums;
});