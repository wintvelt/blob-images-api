import { dbUpdateMulti } from '../libs/dynamodb-lib';
import { cleanRecord } from '../libs/dynamodb-lib-clean';

export const updateUserBase = (newUserBase) => {
    const userId = newUserBase.SK;
    let userUpdate = cleanRecord(newUserBase);
    delete userUpdate.PK;
    delete userUpdate.SK;
    return dbUpdateMulti('USER', userId, userUpdate);
};