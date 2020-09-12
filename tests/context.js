import dynamoDb from '../libs/dynamodb-lib';
import { dbCreateItem } from '../libs/dynamodb-create-lib';

const testUserCognitoId = 'eu-central:test-user';
export const testUserId = 'U' + testUserCognitoId;
export const testGroupId = 'Gtestgroup-1';
export const testAlbumId = 'Atestalbum-1';
export const testPhotoId = 'Ptestphoto-1';

const testUser = {
    name: 'Wouter',
    email: 'wintvelt@xs4all.nl',
};

const recordList = [
    {
        PK: 'UBbase',
        SK: testUserId,
        ...testUser
    },
    {
        PK: 'GBbase',
        SK: testGroupId,
        name: 'test group',
        photoId: testPhotoId
    },
    {
        PK: 'UM' + testUserId,
        SK: testGroupId,
    },
    {
        PK: 'PO' + testPhotoId,
        SK: testUserId,
        user: testUser,
        url: 'dummy'
    },
    {
        PK: 'GA' + testGroupId,
        SK: testAlbumId,
        name: 'test album',
        photoId: testPhotoId
    },
    {
        PK: `GP${testGroupId}#${testAlbumId}`,
        SK: testPhotoId,
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

beforeAll(async () => {
    await setUp();
});

afterAll(async () => {
    await cleanUp();
});



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