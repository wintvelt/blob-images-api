import { dbUpdateMulti, dynamoDb } from 'blob-common/core/db';

export const delUserRatings = async (Keys) => {
    const userId = Keys.SK;

    const ratingsResult = await dynamoDb.query({
        IndexName: process.env.photoIndex,
        KeyConditionExpression: '#sk = :sk and begins_with(PK, :uf)',
        ExpressionAttributeNames: { '#sk': 'SK' },
        ExpressionAttributeValues: {
            ':sk': userId,
            ':uf': 'UF'
        }
    });
    const userRatings = ratingsResult.Items || [];

    let delRatingPromises = [];

    for (let i = 0; i < userRatings.length; i++) {
        const rating = userRatings[i];
        if (rating.rating) {
            // directly set rating to 0, to ensure this happens first
            await dbUpdateMulti(rating.PK, rating.SK, {
                rating: 0,
                prevRating: rating.rating
            });
        }
        // add deletion to promises
        const delRating = dynamoDb.delete({ Key: { PK: rating.PK, SK: rating.SK } });
        delRatingPromises.push(delRating);
    }

    console.log(`deleted ${delRatingPromises.length} ratings by deleted user`);
    return delRatingPromises;
};