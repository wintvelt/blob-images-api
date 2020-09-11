import handler from "../libs/handler-lib";
import sanitize from 'sanitize-html';
import { dbCreateItem } from "../libs/dynamodb-create-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const cognitoId = event.requestContext.identity.cognitoIdentityId;

    const Item = {
        PK: 'UBbase',
        SK: 'U' + cognitoId,
        name: sanitize(data.name),
        email: data.email.toLowerCase(),
        avatar: data.avatar,
    };

    const result = await dbCreateItem(Item);

    return result;
});