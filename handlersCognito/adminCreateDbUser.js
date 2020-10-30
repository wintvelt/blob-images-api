import { dbCreateItem } from 'blob-common/core/dbCreate';

const createDbUser = async (request) => {
    const { sub, email } = request.userAttributes;

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
};
export const adminCreateDbUser = (request) => {
    createDbUser(request);
};