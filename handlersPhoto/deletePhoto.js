import handler from "../libs/handler-lib";
import dynamoDb, { getMemberships } from "../libs/dynamodb-lib";
import s3 from '../libs/s3-lib';

const groupUpdate = (photoUrl) => (group) => ({
    Update: {
        TableName: process.env.photoTable,
        Key: {
            PK: 'GBbase',
            SK: group.SK
        },
        UpdateExpression: "REMOVE #image, #imageUrl",
        ConditionExpression: '#imageUrl = :photoUrl',
        ExpressionAttributeNames: {
            '#image': 'image',
            '#imageUrl': 'imageUrl',
        },
        ExpressionAttributeValues: {
            ":photoUrl": photoUrl,
        },
    }
});
const userUpdate = (photoUrl) => (userId) => ({
    TableName: process.env.photoTable,
    Key: {
        PK: 'UBbase',
        SK: userId
    },
    UpdateExpression: "REMOVE #avatar",
    ConditionExpression: '#avatar = :photoUrl',
    ExpressionAttributeNames: {
        '#avatar': 'avatar',
    },
    ExpressionAttributeValues: {
        ":photoUrl": photoUrl,
    },
});


export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;

    const photoParams = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'PO' + event.pathParameters.id,
            SK: userId,
        },
        ReturnValues: "ALL_OLD"
    };

    const result = await dynamoDb.delete(photoParams);
    if (!result.Attributes) {
        throw new Error("Photo not found.");
    };
    const photoUrl = result.Attributes.url;
    console.log(photoUrl);

    const groups = await getMemberships(userId);
    try {
        await dynamoDb.transact({
            TransactItems: groups.map(groupUpdate(photoUrl))
        });
        await dynamoDb.update(userUpdate(photoUrl)(userId));
        await s3.delete({
            Key: photoUrl
        });
    } catch (error) {
        console.log(error);
    }

    return 'ok';
});
