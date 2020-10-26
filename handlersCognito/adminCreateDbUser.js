import { dbCreateItem } from 'blob-common/core/dbCreate';

const createDbUser = async (request) => {
    await dbCreateItem({
        PK: 'UBbase',
        SK: 'U'+request.userAttributes.sub,
        email: request.userAttributes.email
    });
};
export const adminCreateDbUser = (request) => {
    createDbUser(request);
};