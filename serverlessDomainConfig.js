// to connect the dbStream function to the correct stream in dynamoDb
module.exports.dynamoStream = () => ({
    'dev': 'arn:aws:dynamodb:eu-central-1:899888592127:table/blob-images-photos-dev/stream/2020-09-22T17:50:29.898',
    'prod': 'arn:aws:dynamodb:eu-central-1:899888592127:table/blob-images-photos/stream/2020-09-09T17:57:49.872'
});