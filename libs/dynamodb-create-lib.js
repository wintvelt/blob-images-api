import dynamoDb from "./dynamodb-lib";
import { now, RND } from "./helpers";

export const dbItem = (item) => {
    const createdAt = now();
    let Item = { ...item };
    delete Item.compAfterDate;
    delete Item.compAfterType;
    const comp = createdAt + (item.compAfterDate ? '#' + item.compAfterDate : '');
    const type = item.PK.slice(0, 2) + (item.compAfterType || '');
    Item.comp = comp;
    Item.createdAt = createdAt;
    Item.type = type;
    Item.RND = RND();
    return Item;
};

export const dbCreate = (Item) => {
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