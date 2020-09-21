import { handler, getUserFromEvent } from "blob-common/core/handler";
import { dbUpdateMulti } from "blob-common/core/db";
import { sanitize } from "blob-common/core/sanitize";
import { getPhotoById } from "../libs/dynamodb-lib-single";

export const main = handler(async (event, context) => {
    const userId = getUserFromEvent(event);
    const data = JSON.parse(event.body);
    let userUpdate = {};
    // name update only if given and not empty
    if (data.name) userUpdate.name = sanitize(data.name);
    // photoId update also if empty (to delete photo Id)
    if (data.hasOwnProperty('photoId')) {
        const photoFound = data.photoId && await getPhotoById(data.photoId, userId);
        if (photoFound) {
            userUpdate.photoUrl = photoFound.url;
            userUpdate.photoId = data.photoId;
        };
    };
    const hasUpdates = (Object.keys(userUpdate).length > 0);
    if (hasUpdates) await dbUpdateMulti('UBbase', userId, userUpdate);

    return { status: true };
});