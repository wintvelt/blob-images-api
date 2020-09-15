export default function handler(lambda) {
    return function (event, context) {
        return Promise.resolve()
            // Run the Lambda
            .then(() => lambda(event, context))
            // On success
            .then((responseBody) => [200, responseBody])
            // On failure
            .catch((e) => {
                console.log(e);
                return [500, { error: e.message }];
            })
            // Return HTTP response
            .then(([statusCode, body]) => ({
                statusCode,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify(body),
            }));
    };
}

export const getUserFromEvent = (event) => {
    const authProvider = event.requestContext.identity.cognitoAuthenticationProvider;
    // Cognito authentication provider looks like:
    // cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
    // Where us-east-1_aaaaaaaaa is the User Pool id
    // And qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr is the User Pool User Id
    const parts = authProvider.split(':');

    // const userPoolIdParts = parts[parts.length - 3].split('/');
    // const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
    const userPoolUserId = parts[parts.length - 1];

    return 'U' + userPoolUserId;
};