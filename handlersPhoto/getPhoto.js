import handler, { getUserFromEvent } from "../libs/handler-lib";
import { getPhotoByUser } from "../libs/dynamodb-lib-single";
import { cleanRecord } from "../libs/dynamodb-lib-clean";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const photoId = event.pathParameters.id;
    // get photo
    const photo = await getPhotoByUser(photoId, userId);

    return cleanRecord(photo);
});
