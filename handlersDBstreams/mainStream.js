import { handler } from "blob-common/core/handler";
import { cleanRecord } from "blob-common/core/dbClean";
import { updateMemberUser } from "./userChangeToMembership";
import { updatePhotoUser } from "./userBaseChangeToPhoto";
import { updatePubPhoto } from "./photoChangeToPub";
import { updateCoverPhoto } from "./photoChangeToCover";
import { updateMemberGroup } from "./groupChangeToMembership";
import { updateAlbumGroup } from "./groupChangeToAlbum";
import { updatePhotoRating } from "./ratingChangeToPhoto";
import { updateUserBase } from "./userBaseChangeToUser";
import { updateMemberSeenPics } from "./groupPhotoAddToMember";
import { cleanMemberSeenPics } from "./groupPhotoDelToMember";
import { clearMemberRating } from "./groupPhotoDelToRating";
import { removeMemberAlbumPhotos } from "./memberDelToAlbumPhoto";
import { clearGroupAlbumCover } from "./groupPhotoDelToCover";
import { cleanGroupMembers } from "./memberDelToGroup";
import { delGroupMembers } from "./groupDelToMembers";
import { removeAlbumPhotos } from "./albumDelToAlbumPhoto";
import { delGroupAlbums } from "./groupDelToAlbums";
import { delPhotoRatings } from "./photoDelToRating";
import { delPhotoPubs } from "./photoDelToPublications";
import { clearCovers } from "./photoDelToCover";
import { delUserRatings } from "./userDelToRating";
import { delUserBase } from "./userDelToBase";
import { delUserPhotos } from "./userDelToPhotos";
import { delUserMemberships } from "./userDelToMemberships";
import { decPhotoCount } from "./photoDelToStats";
import { incPhotoCount } from "./photoAddToStats";

const getEvent = (eventRecord) => eventRecord.eventName;
const getType = (Keys) => Keys.PK?.slice(0, 2);

// NB is NOT tail call optimised
const flatItem = (item) => {
    if (item.S) return item.S;
    if (item.M) {
        let outObj = {};
        Object.keys(item.M).forEach(key => {
            outObj[key] = flatItem(item.M[key]);
        });
        return outObj;
    };
    if (item.L) return item.L.map(el => flatItem(el));
    if (item.N) return item.N;
    return item;
};

const flatObj = (obj) => {
    let outObj = {};
    Object.keys(obj).forEach(key => {
        outObj[key] = flatItem(obj[key]);
    });
    return outObj;
};

const recordHandler = async (record) => {
    const eventType = getEvent(record);
    const Keys = flatObj(record.dynamodb.Keys);
    const dbType = getType(Keys);
    const newRecord = record.dynamodb.NewImage && flatObj(record.dynamodb.NewImage);
    const cleanRec = cleanRecord(newRecord);

    console.log({ dbType, eventType });
    switch (dbType) {
        case 'UV': {
            // user visit record (dates or cognito Id)
            if (eventType === 'MODIFY' || eventType === 'INSERT') {
                console.log('updating user visit change to user');
                await updateUserBase(newRecord);
            }
            break;
        }
        case 'UB': {
            // user base record
            if (eventType === 'MODIFY' || eventType === 'INSERT') {
                console.log('updating user base to user, photos');
                await Promise.all([
                    updateUserBase(newRecord),
                    ...await updatePhotoUser(cleanRec)
                ]);
            }
            break;
        }
        case 'US': {
            // user full record
            if (eventType === 'MODIFY') {
                console.log('updating user change to memberships');
                const memberUpdates = await updateMemberUser(cleanRec);
                await Promise.all([
                    ...memberUpdates
                ]);
            } else if (eventType === 'REMOVE') {
                console.log('updating user delete to ratings, base/visit, photos, memberships');
                await Promise.all([
                    ...await delUserBase(Keys),
                    ...await delUserRatings(Keys),
                    ...await delUserPhotos(Keys),
                    ...await delUserMemberships(Keys)
                ]);
            }
            break;
        }
        case 'PO': {
            // photo record
            if (eventType === 'MODIFY') {
                console.log('updating photo change to publications, covers');
                await Promise.all([
                    ...await updatePubPhoto(cleanRec),
                    ...await updateCoverPhoto(cleanRec)
                ]);
            } else if (eventType === 'REMOVE') {
                console.log('updating photo delete to publications, ratings, covers, user stats');
                await Promise.all([
                    ...await delPhotoPubs(Keys),
                    ...await delPhotoRatings(Keys),
                    ...await clearCovers(Keys),
                    decPhotoCount(Keys)
                ]);
            } else if (eventType === 'INSERT') {
                console.log('updating photo insert to user stats');
                await incPhotoCount(Keys);
            }
            break;
        }
        case 'UF': {
            // rating record
            if (eventType === 'MODIFY' || eventType === 'INSERT') {
                console.log('updating rating change to photo');
                await updatePhotoRating(cleanRec);
            }
            break;
        }
        case 'GB': {
            // group record
            if (eventType === 'MODIFY') {
                console.log('updating group change to memberships, albums');
                await Promise.all([
                    ...await updateMemberGroup(cleanRec),
                    ...await updateAlbumGroup(cleanRec)
                ]);
            } else if (eventType === 'REMOVE') {
                console.log('deleting group members, albums');
                await Promise.all([
                    ...await delGroupMembers(Keys),
                    ...await delGroupAlbums(Keys)
                ]);
            }
            break;
        }
        case 'UM': {
            // membership record
            if (eventType === 'REMOVE') {
                console.log('updating membership delete to member photos, maybe group');
                await Promise.all([
                    ...await removeMemberAlbumPhotos(Keys),
                    ...await cleanGroupMembers(Keys)
                ]);
            }
            break;
        }
        case 'GP': {
            // group photo record
            if (eventType === 'INSERT') {
                console.log('updating photo add to members seenPics');
                await Promise.all(await updateMemberSeenPics(cleanRec));
            } else if (eventType === 'REMOVE') {
                console.log('updating photo remove to members seenPics, ratings');
                await Promise.all([
                    ...await cleanMemberSeenPics(Keys),
                    ...await clearMemberRating(Keys),
                    ...await clearGroupAlbumCover(Keys)
                ]);
            }
            break;
        }
        case 'GA': {
            // album record
            if (eventType === 'REMOVE') {
                console.log('updating album remove to albumPhotos');
                await Promise.all([
                    ...await removeAlbumPhotos(Keys)
                ]);
            }
            break;
        }
        default:
            break;
    }
};

export const main = handler(async (event, context) => {
    const records = event.Records;
    if (!records) console.error('no records in db stream call');

    const recLength = records.length;
    for (let i = 0; i < recLength; i++) {
        const record = records[i];
        await recordHandler(record);
    }
    return 'ok';
});