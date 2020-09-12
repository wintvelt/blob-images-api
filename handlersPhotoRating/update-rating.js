import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { checkUser } from "../libs/dynamodb-lib-single";
import { btoa, now } from "../libs/helpers";
import { listPhotoPublications } from "../libs/dynamodb-lib-photo";

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
    // NB assumes this is not GroupPhoto record
    const ratingParams = {
        TableName: process.env.photoTable,
        Key: userRatingKey
    };
    const ratingResult = await dynamoDb.get(ratingParams);
    const ratingItem = ratingResult.Item;
    const oldUserRating = (ratingItem) ? ratingItem.rating : 0;

    const data = JSON.parse(event.body);
    const userRatingUpdate = parseInt(data.ratingUpdate);
    const oldPhotoRating = photo.rating || 0;

    // if out of bounds return empty
    if (oldUserRating === userRatingUpdate) return 'OK';

    const newUserRating = oldUserRating + userRatingUpdate;
    const newPhotoRating = oldPhotoRating + userRatingUpdate;

    // get all albumphotos
    const photoPublications = await listPhotoPublications(photoId);
    const newPhoto = { ...photo, rating: newPhotoRating };

    // save new rating of user, new photorating in photo + all albumphotos
    // save new photorating in photo

    const saveParams = {
        TransactItems: [
            {
                Update: {
                    TableName: process.env.photoTable,
                    Key: userRatingKey,
                    UpdateExpression: "SET #r = :r, #ca = :ca",
                    ExpressionAttributeNames: {
                        '#r': 'rating',
                        '#ca': 'createdAt'
                    },
                    ExpressionAttributeValues: {
                        ":r": newUserRating,
                        ':ca': now(),
                    },
                    ReturnValues: "NONE"
                }
            },
            {
                Update: {
                    TableName: process.env.photoTable,
                    Key: { PK: photo.PK, SK: photo.SK },
                    UpdateExpression: "SET #r = :r",
                    ExpressionAttributeNames: {
                        '#r': 'rating',
                    },
                    ExpressionAttributeValues: {
                        ":r": newPhotoRating,
                    },
                    ReturnValues: "NONE"
                }
            },
            ...photoPublications.map(pub => ({
                Update: {
                    TableName: process.env.photoTable,
                    Key: { PK: pub.PK, SK: pub.SK },
                    UpdateExpression: "SET #p = :newP",
                    ExpressionAttributeNames: {
                        '#p': 'photo',
                    },
                    ExpressionAttributeValues: {
                        ":newP": newPhoto,
                    },
                    ReturnValues: "NONE"
                }
            }))
        ]
    };
    await dynamoDb.transact(saveParams);

    return { status: true };
});
