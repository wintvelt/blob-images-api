import handler from "../libs/handler-lib";
import dynamoDb, { dbUpdateMulti } from "../libs/dynamodb-lib";
import { getPhotoById } from "../libs/dynamodb-lib-single";

export const main = handler(async (event, context) => {
    const photoId = event.pathParameters.id;
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;

    const photo = getPhotoById(photoId, userId);
    if (!photo) throw new Error('Not authorized to access photo');

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
    const oldUserRating = (ratingItem) ? ratingItem.rating : 0;

    const data = JSON.parse(event.body);
    const userRatingUpdate = parseInt(data.ratingUpdate);

    // if out of bounds return empty
    if (oldUserRating === userRatingUpdate) return '';

    const newUserRating = oldUserRating + userRatingUpdate;

    // save new rating of user
    return await dbUpdateMulti(userRatingKey.PK, userRatingKey.SK, {
        rating: newUserRating,
        prevRating: oldUserRating
    });
});
