import handler from "../libs/handler-lib";
import { listPhotoPublications } from "../libs/dynamodb-query-lib";
import { checkUser } from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const userId = 'U' + event.requestContext.identity.cognitoIdentityId;
    const photoId = event.pathParameters.id;
    const publications = await listPhotoPublications(photoId);
    let filteredResult = [];
    const pubLength = publications.length;
    for (let i = 0; i < pubLength; i++) {
        const pub = publications[i];
        const groupId = pub.PK.split('#')[0].slice(2);
        const userIsInGroup = await checkUser(userId, groupId);
        if (userIsInGroup) filteredResult.push(pub);
    }
    return filteredResult;
});