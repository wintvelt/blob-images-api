// invokes lambda from blob-images-invites to accept the invite for this user

import { lambda } from "blob-common/core/lambda";

// parameters for invoked lambda are:
// const userId = event.requestContext.identity.cognitoAuthenticationProvider = "*:[userid]";
// const inviteId = event.pathParameters.id;

export const acceptMembership = async (stats) => {
    const userId = stats.SK.slice(1);
    if (!stats.inviteId) return; // without an invite, no need to accept

    const event = {
        requestContext: { identity: { cognitoAuthenticationProvider: `*:${userId}` } },
        pathParameters: { id: stats.inviteId }
    };

    const lambdaParams = {
        FunctionName: process.env.acceptInviteLambdaArn,
        InvocationType: 'Event',
        LogType: 'Tail',
        Payload: JSON.stringify(event)
    };

    return lambda.invoke(lambdaParams);
};