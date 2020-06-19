import dynamoDb from "./dynamodb-lib";
import { now, RND } from "./helpers";

export const dbCreateItem = (item) => {
    const createdAt = now();
    let Item = { ...item };
    delete Item.compAfterDate;
    const comp = createdAt + (item.compAfterDate ? '#' + item.compAfterDate : '');
    Item.comp = comp;
    Item.createdAt = createdAt;
    Item.type = item.PK.slice(0, 2);
    Item.RND = RND();
    return dynamoDb.put({
        TableName: process.env.photoTable,
        Item
    });
};