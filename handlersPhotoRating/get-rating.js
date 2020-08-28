import handler from "../libs/handler-lib";
import dynamoDb, { checkUser } from "../libs/dynamodb-lib";
import { btoa } from "../libs/helpers";

export const main = handler(async (event, context) => {
    const Key = JSON.parse(btoa(event.pathParameters.id));
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    if (Key.SK !== userId) {
        const groupId = Key.PK.split('#')[0].slice(2);
        const userIsInGroup = await checkUser(userId, groupId);
        if (!userIsInGroup) throw new Error('Not authorized to access photo');
    };

    // get Photo
    const photoParams = {
        TableName: process.env.photoTable,
        Key
    };

    const result = await dynamoDb.get(photoParams);
    const item = result.Item;
    if (!item) {
        throw new Error("Photo not found.");
    }

    const photo = item.photo || item;
    const photoId = photo.PK.slice(2);

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

    return { rating: ratingItem.rating || 0 };
});
