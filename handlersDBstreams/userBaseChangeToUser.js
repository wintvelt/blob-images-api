import { dbUpdateMulti } from 'blob-common/core/db';
import { cleanRecord } from 'blob-common/core/dbClean';

export const updateUserBase = (newUserBase) => {
    const userId = newUserBase.SK;
    let userUpdate = cleanRecord(newUserBase);
    delete userUpdate.PK;
    delete userUpdate.SK;
    if (newUserBase.cognitoId) userUpdate.cognitoId = newUserBase.cognitoId;
    return dbUpdateMulti('USER', userId, userUpdate);
};