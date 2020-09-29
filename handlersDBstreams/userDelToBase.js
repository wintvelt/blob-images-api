import { dynamoDb } from 'blob-common/core/db';

export const delUserBase = async (Keys) => {
    const userId = Keys.SK;

    const delBasePromises = [
        dynamoDb.delete({ Key: {
            PK: 'UBbase',
            SK: userId
        }}),
        dynamoDb.delete({ Key: {
            PK: 'UVvisit',
            SK: userId
        }}),
    ];

    return delBasePromises;
};