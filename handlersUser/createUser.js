// called by AWS cognito post confirmation trigger
import { handler } from "blob-common/core/handler";
import { sanitize } from 'blob-common/core/sanitize';
import { dbCreateItem } from "blob-common/core/dbCreate";
import { cleanRecord } from "blob-common/core/dbClean";

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