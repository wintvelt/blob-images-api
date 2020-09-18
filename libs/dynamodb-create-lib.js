import dynamoDb from "./dynamodb-lib";
import { now, RND } from "./helpers";

export const dbItem = (item) => {
    // add createdAt date + RK (random key) + date keys (for date search)
    const createdAt = now();
    const RK = RND();
    // date key with id for PO (my photos) and GP (group photos per album), otherwise just type
    const recordType = item.PK.slice(0, 2);
    const datePK = (recordType === 'PO') ?
        'PO' + item.SK
        : (recordType === 'GP') ?
            item.PK
            : recordType;
    const dateSK = (recordType === 'PO') ?
        createdAt
        : (recordType === 'GP') ?
            `${createdAt}#${item.PK}`
            : `${createdAt}#${item.PK}#${item.SK}`;
    return {
        ...item,
        createdAt,
        RK,
        datePK,
        dateSK
    };
};

const dbCreate = (Item) => {
    return dynamoDb.put({
        TableName: process.env.photoTable,
        Item
    });
};
export const dbCreateItem = async (item) => {
    const Item = dbItem(item);
    await dbCreate(Item);
    return Item;
};