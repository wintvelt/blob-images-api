import handler from "../libs/handler-lib";
import { listPhotosByDate } from "../libs/dynamodb-query-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const photos = await listPhotosByDate(userId);
    return photos;
});