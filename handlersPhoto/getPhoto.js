import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import { getMember } from "../libs/dynamodb-lib-single";
import { btoa } from "../libs/helpers";

export const main = handler(async (event, context) => {
    const Key = JSON.parse(btoa(event.pathParameters.id));
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    let seenPics = [];
    let albumId = '';
    if (Key.SK !== userId) {
        const groupId = Key.PK.split('#')[0].slice(2);
        const membership = await getMember(userId, groupId);
        const userIsInGroup = membership && (membership.status === 'active');
        if (!userIsInGroup) throw new Error('Not authorized to load photo');
        if (membership.seenPics) {
            seenPics = membership.seenPics;
            albumId = Key.PK.split('#')[1];
        };
    };

    const params = {
        TableName: process.env.photoTable,
        Key
    };

    const result = await dynamoDb.get(params);
    const item = result.Item;
    if (!item) {
        throw new Error("Item not found.");
    }

    const photo = item.photo || item;
    const newKey = `${albumId}#${photo.PK.slice(2)}`;
    const photoWithNew = (albumId) ?
        { ...photo, isNew: !!seenPics.find(pic => (pic.albumPhoto === newKey))}
        : photo;

    // Return the photo
    return photoWithNew;
});
