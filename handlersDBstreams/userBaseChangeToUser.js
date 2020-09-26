import { dbUpdateMulti } from 'blob-common/core/db';
import { cleanRecord } from 'blob-common/core/dbClean';

export const updateUserBase = (newUserBase) => {
    const userId = newUserBase.SK;
    let userUpdate = cleanRecord(newUserBase);
    delete userUpdate.PK;
    delete userUpdate.SK;
    if (newUserBase.PK === 'UBbase') {
        userUpdate.createdAt = newUserBase.createdAt;
        userUpdate.RK = newUserBase.RK;
        // also include photo keys, to remove if they are empty
        userUpdate.photoId = newUserBase.photoId;
        userUpdate.photoUrl = newUserBase.photoUrl;
    } else {
        delete userUpdate.createdAt;
    }
    return dbUpdateMulti('USER', userId, userUpdate);
};