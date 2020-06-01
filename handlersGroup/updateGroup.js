import handler from "../libs/handler-lib";
import dynamoDb, { getMemberRole, getMembers, listGroupAlbums } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const data = JSON.parse(event.body);

    const memberRole = await getMemberRole(userId, groupId);
    if (memberRole !== 'admin') throw new Error('group update not allowed');

    const newGroup = {
        id: groupId,
        name: data.name,
        description: data.description || null,
        image: data.image || null,
        imageUrl: (data.image) ? data.image.image : null,
    };

    const groupParams = {
        TableName: process.env.photoTable,
        Key: {
            PK: 'GBbase',
            SK: groupId,
        },
        UpdateExpression: "SET #name = :name, #desc = :desc, #img = :img, #imgUrl = :imgUrl",
        ExpressionAttributeNames: {
            '#name': 'name',
            "#desc": 'description',
            '#img': 'image',
            '#imgUrl': 'imageUrl',
        },
        ExpressionAttributeValues: {
            ":name": newGroup.name,
            ":desc": newGroup.description,
            ':img': newGroup.image,
            ':imgUrl': newGroup.imageUrl,
        },
        ReturnValues: "NONE"
    };
    const groupMembers = await getMembers(groupId);
    const groupAlbums = await listGroupAlbums(groupId, memberRole);
    await dynamoDb.transact({
        TransactItems: [
            { Update: groupParams },
            ...groupMembers.map(item => ({
                Update: {
                    TableName: process.env.photoTable,
                    Key: {
                        PK: item.PK,
                        SK: item.SK,
                    },
                    UpdateExpression: "SET #group = :newGroup",
                    ExpressionAttributeNames: {
                        '#group': 'group',
                    },
                    ExpressionAttributeValues: {
                        ":newGroup": newGroup,
                    },
                    ReturnValues: "NONE"
                }
            })),
            ...groupAlbums.map(item => ({
                Update: {
                    TableName: process.env.photoTable,
                    Key: {
                        PK: item.PK,
                        SK: item.SK,
                    },
                    UpdateExpression: "SET #group = :newGroup",
                    ExpressionAttributeNames: {
                        '#group': 'group',
                    },
                    ExpressionAttributeValues: {
                        ":newGroup": newGroup,
                    },
                    ReturnValues: "NONE"
                }
            }))
        ]
    });

    return { status: true };
});