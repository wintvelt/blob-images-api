import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.photoIndex,
        KeyConditionExpression: "#u = :user",
        ExpressionAttributeNames: {
            '#u': 'SK'
        },
        ExpressionAttributeValues: {
            ":user": 'U' + event.requestContext.identity.cognitoIdentityId
        },
    };

    const result = await dynamoDb.query(params);

    // Return the matching list of items in response body
    return result.Items;
});