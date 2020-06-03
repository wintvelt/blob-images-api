import handler from "../libs/handler-lib";
import dynamoDb, { getMemberRole, getPhoto } from "../libs/dynamodb-lib";
import { now } from '../libs/helpers';

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const albumId = event.pathParameters.albumid;
    const data = JSON.parse(event.body);

    const memberRole = await getMemberRole(userId, groupId);
    if (!memberRole) throw new Error('not a member of this group');
    const userIsAdmin = (memberRole === 'admin');
    if (!userIsAdmin) throw new Error('not authorized to add photos');

    const photo = await getPhoto(data.photoId);
    const params = {
        TableName: process.env.photoTable,
        Item: {
            PK: `GP${groupId}#${albumId}`,
            SK: data.photoId,
            createdAt: now(),
            photo,
        }
    };
    await dynamoDb.put(params);

    return params.Item;
});
