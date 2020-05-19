import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const params = {
        TableName: process.env.photoTable,
        IndexName: process.env.photoIndex,
        KeyConditionExpression: "#u = :user and begins_with(PK, :p)",
        ExpressionAttributeNames: {
            '#u': 'SK',
        },
        ExpressionAttributeValues: {
            ":user": 'U' + event.requestContext.identity.cognitoIdentityId,
            ":p": 'PO',
        },
    };

    const result = await dynamoDb.query(params);

    // Return the matching list of items in response body
    return result.Items;
});