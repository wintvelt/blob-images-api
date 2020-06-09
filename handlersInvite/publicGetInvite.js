import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { btoa } from "../libs/helpers";

export const main = handler(async (event, context) => {
    // const userId = event.requestContext && event.requestContext.identity &&
    //     'U' + event.requestContext.identity.cognitoIdentityId;
    try {
        const Key = JSON.parse(btoa(event.pathParameters.id));
        // check if invite is for user, if so: must be logged in user
        const params = {
            TableName: process.env.photoTable,
            Key
        };

        const result = await dynamoDb.get(params);
        if (!result.Item) {
            throw new Error("Item not found.");
        }
        // check if invite is still valid

        // Return the retrieved item
        return result.Item;
    } catch (error) {
        throw new Error('invalid invite ID');
    }
});
