import handler from "../libs/handler-lib";
import { getUser } from "../libs/dynamodb-lib-single";

export const main = handler(async (event, context) => {
    const user = await getUser(event.pathParameters.id);
    return user;
});
