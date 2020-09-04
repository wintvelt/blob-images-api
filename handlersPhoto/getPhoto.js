import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { checkUser } from "../libs/dynamodb-lib-single";
import { btoa } from "../libs/helpers";

export const main = handler(async (event, context) => {
    const Key = JSON.parse(btoa(event.pathParameters.id));
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    if (Key.SK !== userId) {
        const groupId = Key.PK.split('#')[0].slice(2);
        const userIsInGroup = await checkUser(userId, groupId);
        if (!userIsInGroup) throw new Error('Not authorized to load photo');
    };

    const params = {
        TableName: process.env.photoTable,
        Key
    };

    const result = await dynamoDb.get(params);
    const item = result.Item;
    if (!item) {
        throw new Error("Item not found.");
    }

    // Return the photo
    return item.photo || item;
});
