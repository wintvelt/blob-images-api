import handler from "../libs/handler-lib";
import { cleanRecord } from "../libs/dynamodb-lib-clean";
import { updateMemberUser } from "./userChangeToMembership";
import { updatePhotoUser } from "./userChangeToPhoto";
import { updatePubPhoto } from "./photoChangeToPub";
import { updateCoverPhoto } from "./photoChangeToCover";
import { updateMemberGroup } from "./groupChangeToMembership";
import { updateAlbumGroup } from "./groupChangeToAlbum";

const getEvent = (eventRecord) => eventRecord.eventName;
const getType = (Keys) => Keys.PK?.slice(0, 2);

// NB is NOT tall call optimised
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
        case 'UB': {
            // user base record
            if (eventType === 'MODIFY') {
                console.log('updating user change to memberships, photos');
                const memberUpdates = await updateMemberUser(cleanRec);
                await Promise.all([
                    ...memberUpdates,
                    ...await updatePhotoUser(cleanRec)
                ]);
            }
            break;
        }
        case 'PO': {
            // photo record
            if (eventType === 'MODIFY') {
                console.log('updating photo change to publications and covers');
                await Promise.all([
                    ...await updatePubPhoto(cleanRec),
                    ...await updateCoverPhoto(cleanRec)
                ]);
            }
            break;
        }
        case 'UF': {
            // rating record
            break;
        }
        case 'GB': {
            // group record
            if (eventType === 'MODIFY') {
                console.log('updating group change to memberships');
                await Promise.all([
                    ...await updateMemberGroup(cleanRec),
                    ...await updateAlbumGroup(cleanRec)
                ]);
            }
            break;
        }
        case 'UM': {
            // membership record
            break;
        }
        case 'GP': {
            // group photo record
            break;
        }
        case 'GA': {
            // album record
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