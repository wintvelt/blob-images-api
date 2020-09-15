import dynamoDb from '../libs/dynamodb-lib';
import { dbCreateItem } from '../libs/dynamodb-create-lib';

const testUserCognitoId = 'eu-central:test-user';
export const testUserId = 'U'+'normal-test-id';
export const testGroupId = 'Gtestgroup-1';
export const testAlbumId = 'Atestalbum-1';
export const testPhotoId = 'Ptestphoto-1';

export const testUser = {
    name: 'Wouter',
    email: 'wintvelt@xs4all.nl',
};

export const setUp = async (recordList) => {
    let promises = [];
    for (let i = 0; i < recordList.length; i++) {
        const rec = recordList[i];
        promises.push(dbCreateItem(rec));
    }
    return Promise.all(promises);
};

export const cleanUp = async (recordList) => {
    let promises = [];
    for (let i = 0; i < recordList.length; i++) {
        const rec = recordList[i];
        promises.push(dynamoDb.delete({
            TableName: process.env.photoTable,
            Key: {
                PK: rec.PK,
                SK: rec.SK,
            }
        }));
    }
    return Promise.all(promises);
};

export const eventContext = (event) => {
    const { body, pathParameters, cognitoUserId = testUserCognitoId } = event || {};
    return {
        "requestContext": {
            "identity": {
                "cognitoIdentityId": cognitoUserId,
                "cognitoAuthenticationProvider": `cognito-idp....:${testUserId.slice(1)}`
            }
        },
        body: (body) ? JSON.stringify(body) : '',
        pathParameters
    };
};

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};