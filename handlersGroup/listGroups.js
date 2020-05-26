import handler from "../libs/handler-lib";
import dynamoDb, { getMemberships } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const items = await getMemberships('U' + event.requestContext.identity.cognitoIdentityId);
    const groups = items.map(item => ({
        id: item.SK,
        member: item.member,
        group: item.group,
        role: item.role,
        date: item.createdAt,
    }));

    return groups;
});