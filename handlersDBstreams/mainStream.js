import handler from "../libs/handler-lib";

const getType = (eventRecord) => eventRecord.dynamodb?.Keys?.PK?.S?.slice(0, 2);
const getEvent = (eventRecord) => eventRecord.eventName;

const recordHandler = async (record) => {
    const recType = getType(record);
    const eventType = getEvent(record);
    console.log({recType, eventType});
    switch (recType) {
        case 'UB': {
            // user base record
            break;
        }
        case 'PO': {
            // photo record
            break;
        }
        case 'UF': {
            // rating record
            break;
        }
        case 'GB': {
            // group record
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