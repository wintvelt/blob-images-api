// to connect the dbStream function to the correct stream in dynamoDb
module.exports.dynamoStream = () => ({
    'dev': 'arn:aws:dynamodb:eu-central-1:899888592127:table/blob-images-photos-dev/stream/2020-09-22T17:50:29.898',
    'prod': 'arn:aws:dynamodb:eu-central-1:899888592127:table/blob-images-photos-prod/stream/2020-11-01T18:41:37.291'
});

module.exports.frontend = () => ({
    'dev': 'http://localhost:3000',
    'prod': 'https://clubalmanac.com'
});

module.exports.webmaster = () => ({
    'dev': 'wintvelt@me.com',
    'prod': 'wintvelt@me.com'
});

module.exports.bucket = () => ({
    'dev': 'blob-images-dev',
    'prod': 'blob-images'
});

module.exports.userpool = () => ({
    'dev': 'blob-images-users-dev',
    'prod': 'blob-images-users'
});