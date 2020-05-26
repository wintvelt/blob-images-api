import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const params = {
        TableName: process.env.photoTable,
        KeyConditionExpression: "#u = :member",
        ExpressionAttributeNames: {
            '#u': 'PK',
        },
        ExpressionAttributeValues: {
            ":member": 'UMU' + event.requestContext.identity.cognitoIdentityId,
        },
    };

    const result = await dynamoDb.query(params);
    const items = result.Items;
    if (!items) {
        throw new Error("photos retrieval failed.");
    }

    const groups = items.map(item => ({
        id: item.SK,
        member: item.member,
        group: item.group,
        role: item.role,
        date: item.createdAt,
    }));

    return groups;
});