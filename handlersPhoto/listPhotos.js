import handler, { getUserFromEvent } from "../libs/handler-lib";
import { listPhotosByDate } from "../libs/dynamodb-query-lib";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const photos = await listPhotosByDate(userId);
    return photos.map(key => key.PK.slice(2));
});