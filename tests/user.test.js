import { dbCreateItem } from '../libs/dynamodb-create-lib';
import dynamoDb from '../libs/dynamodb-lib';
import AWS from "aws-sdk";

const testUserId = 'Ueu-central-test-user';

beforeAll(() => {
    return dbCreateItem({
        PK: 'UBbase',
        SK: testUserId,
        name: 'Wouter',
        email: 'wintvelt@xs4all.nl',
    })
});

afterAll(() => {
    return dynamoDb.delete({
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: testUserId,
        }
    });
})

test('Change username', async () => {
    expect(true).toEqual(true);
});



