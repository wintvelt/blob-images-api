// called by AWS cognito post confirmation trigger
import handler from "../libs/handler-lib";
import sanitize from 'sanitize-html';
import { dbCreateItem } from "../libs/dynamodb-create-lib";
import { cleanRecord } from "../libs/dynamodb-lib-clean";

export const main = handler(async (event, context) => {
    const { request } = event;

    const userSub = request?.userAttributes?.sub;

    if (userSub) {
        const name = request.userAttributes.name;
        const email = request.userName;

        const Item = {
            PK: 'UBbase',
            SK: 'U' + userSub,
            name: sanitize(name),
            email: email.toLowerCase(),
        };

        const result = await dbCreateItem(Item);

        return cleanRecord(result);
    }
    // if no update needed
    return 'ok';
});