import handler from "../libs/handler-lib";
import { getLoginUser } from "../libs/dynamodb-lib-single";

export const main = handler(async (event, context) => {
    const user = await getLoginUser(event.pathParameters.id);
    return user;
});
