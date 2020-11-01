import { dbCreateItem } from 'blob-common/core/dbCreate';

const createDbUser = async (request) => {
    const { sub, email } = request.userAttributes;

    try {
        await Promise.all([
            dbCreateItem({
                PK: 'UBbase',
                SK: 'U' + sub,
                email: email
            }),
            dbCreateItem({
                PK: 'UPstats',
                SK: 'U' + sub,
                photoCount: 0
            })
        ]);
    } catch (error) {
        console.log('DB creation failed');
    }
};
export const adminCreateDbUser = (request) => {
    createDbUser(request);
};