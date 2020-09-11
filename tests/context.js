import dynamoDb from '../libs/dynamodb-lib';
import { dbCreateItem } from '../libs/dynamodb-create-lib';

const testUserCognitoId = 'eu-central:test-user';
export const testUserId = 'U' + testUserCognitoId;
export const testGroupId = 'Gtestgroup-1';

const recordList = [
    {
        PK: 'UBbase',
        SK: testUserId,
        name: 'Wouter',
        email: 'wintvelt@xs4all.nl',
    },
    {
        PK: 'GBbase',
        SK: testGroupId,
    },
    {
        PK: 'UM' + testUserId,
        SK: testGroupId,
    }
];

export const setUp = async () => {
    for (let i = 0; i < recordList.length; i++) {
        const rec = recordList[i];
        // result var needed for jest somehow
        const result = await dbCreateItem(rec);
    }
};

export const cleanUp = async () => {
    for (let i = 0; i < recordList.length; i++) {
        const rec = recordList[i];
        // result var needed for jest somehow
        const result = await dynamoDb.delete({
            TableName: process.env.photoTable,
            Key: {
                PK: rec.PK,
                SK: rec.SK,
            }
        });
    }
};

export const eventContext = (event) => {
    const { body, pathParameters, cognitoUserId = testUserCognitoId } = event || {};
    return {
        "requestContext": {
            "identity": {
                "cognitoIdentityId": cognitoUserId
            }
        },
        body: (body) ? JSON.stringify(body) : '',
        pathParameters
    };
};

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};