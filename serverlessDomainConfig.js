// to connect the dbStream function to the correct stream in dynamoDb
module.exports.dynamoStream = () => ({
    'dev': 'arn:aws:dynamodb:eu-central-1:899888592127:table/blob-images-photos-dev/stream/2020-09-22T17:50:29.898',
    'prod': 'arn:aws:dynamodb:eu-central-1:899888592127:table/blob-images-photos/stream/2020-09-09T17:57:49.872'
});

module.exports.frontend = () => ({
    'dev': 'http://localhost:3000',
    'prod': 'clubalmanac.com'
});

module.exports.bucket = () => ({
    'dev': 'blob-images-dev',
    'prod': 'blob-images'
});

module.exports.userpool = () => ({
    'dev': 'blob-images-users-dev',
    'prod': 'blob-images-users'
});