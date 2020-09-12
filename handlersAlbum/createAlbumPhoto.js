import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getMember, getPhotoByUser } from "../libs/dynamodb-lib-single";
import { dbCreateItem } from "../libs/dynamodb-create-lib";
import { getMembers } from "../libs/dynamodb-lib-memberships";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const groupId = event.pathParameters.id;
    const albumId = event.pathParameters.albumid;
    const data = JSON.parse(event.body);
    const { photoId, filename } = data;

    const membership = await getMember(userId, groupId);
    if (!membership || membership.status === 'invite') throw new Error('not a member of this group');
    const userIsAdmin = (membership.role === 'admin');
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
    const albumPhoto = await dbCreateItem(Item);

    // update seenPics in memberships for other users of same group
    const members = await getMembers(groupId);
    let seenPicsPromises = [];
    const newPics = [{ albumPhoto: `${albumId}#${foundPhotoId}` }];
    for (let j = 0; j < members.length; j++) {
        const member = members[j];
        if (member.PK.slice(2) !== userId) {
            const oldSeenPics = member.seenPics || [];
            const oldSeenPicsKeys = oldSeenPics.map(it => it.albumPhoto);
            const newSeenPics = [
                ...oldSeenPics,
                ...newPics.filter(it => !oldSeenPicsKeys.includes(it.albumPhoto))
            ];
            const newPhotoUpdate = dynamoDb.update({
                TableName: process.env.photoTable,
                Key: {
                    PK: member.PK,
                    SK: member.SK
                },
                UpdateExpression: 'SET #s = :ns',
                ExpressionAttributeNames: { '#s': 'seenPics' },
                ExpressionAttributeValues: { ':ns': newSeenPics }
            });
            seenPicsPromises.push(newPhotoUpdate);
        }
    }
    await Promise.all(seenPicsPromises);
    return albumPhoto;
});
