import handler, { getUserFromEvent } from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getPhotoById } from "../libs/dynamodb-lib-single";

export const main = handler(async (event, context) => {
    const photoId = event.pathParameters.id;
    const userId = getUserFromEvent(event);

    const photo = await getPhotoById(photoId, userId);
    if (!photo) throw new Error('no access to photo');

    const userRatingKey = {
        PK: 'UF' + photoId,
        SK: userId,
    };

    // get rating (may not exist)
    const ratingParams = {
        TableName: process.env.photoTable,
        Key: userRatingKey
    };
    const ratingResult = await dynamoDb.get(ratingParams);
    const ratingItem = ratingResult.Item;

    return { rating: ratingItem?.rating || 0 };
});
