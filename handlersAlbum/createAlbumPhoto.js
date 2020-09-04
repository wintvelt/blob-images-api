import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getMemberRole, getPhotoByUser } from "../libs/dynamodb-lib-single";
import { dbCreateItem } from "../libs/dynamodb-create-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const albumId = event.pathParameters.albumid;
    const data = JSON.parse(event.body);
    const { photoId, filename } = data;

    const memberRole = await getMemberRole(userId, groupId);
    if (!memberRole) throw new Error('not a member of this group');
    const userIsAdmin = (memberRole === 'admin');
    if (!userIsAdmin) throw new Error('not authorized to add photos');

    let photo;
    if (photoId) {
        photo = await getPhotoByUser(photoId, userId);
    } else {
        console.log(filename);
        const result = await dynamoDb.query({
            TableName: process.env.photoTable,
            IndexName: process.env.photoIndex,
            KeyConditionExpression: "#u = :user and begins_with(PK, :p)",
            ExpressionAttributeNames: {
                '#u': 'SK',
            },
            ExpressionAttributeValues: {
                ":user": userId,
                ":p": 'PO',
            },
        });
        const photos = result.Items;
        photo = photos.find(p => p.url.includes(filename));
    }
    if (!photo) throw new Error('photo not found');

    const foundPhotoId = photo.PK.slice(2);
    const Item = {
        PK: `GP${groupId}#${albumId}`,
        SK: foundPhotoId,
        photo,
        compAfterDate: foundPhotoId,
        compAfterType: `${groupId}#${albumId}`,
    };
    const result = await dbCreateItem(Item);

    return result;
});
