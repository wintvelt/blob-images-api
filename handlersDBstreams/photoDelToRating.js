import { dynamoDb } from 'blob-common/core/db';

export const delPhotoRatings = async (Keys) => {
    const photoId = Keys.PK.slice(2);
    let delPromises = [];

    const ratingResult = await dynamoDb.query({
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: { '#pk': 'PK' },
        ExpressionAttributeValues: { ':pk': 'UF' + photoId }
    });
    const photoRatings = ratingResult.Items || [];

    for (let i = 0; i < photoRatings.length; i++) {
        const rating = photoRatings[i];
        delPromises.push(dynamoDb.delete({
            Key: { PK: rating.PK, SK: rating.SK }
        }));
    }
    console.log(`${delPromises.length} ratings deleted for deleted photo`);
    return delPromises;
};