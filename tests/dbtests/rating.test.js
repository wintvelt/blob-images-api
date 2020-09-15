import dynamoDb from '../../libs/dynamodb-lib';
import { eventContext, testUserId, testUser, testPhotoId, sleep, setUp, cleanUp } from '../context';
import { main as updateRating } from '../../handlersPhotoRating/updateRating';
import { getPhotoById } from '../../libs/dynamodb-lib-single';

const TIMEOUT = 2000;

const recordList = [
    {
        PK: 'UBbase',
        SK: testUserId,
        ...testUser
    },
    {
        PK: 'PO' + testPhotoId,
        SK: testUserId,
        url: 'dummy',
    },
];

beforeAll(async () => {
    await setUp(recordList);
    await sleep(TIMEOUT);
}, TIMEOUT + 2000);


afterAll(async () => {
    await sleep(TIMEOUT);
    await cleanUp(recordList);
    await Promise.all([
        dynamoDb.delete({
            TableName: process.env.photoTable,
            Key: {
                PK: 'UF' + testPhotoId,
                SK: testUserId,
            }
        }),
    ]);
}, TIMEOUT + 8000);

test('Create a new rating', async () => {
    const event = eventContext({
        pathParameters: { id: testPhotoId },
        body: { ratingUpdate: 1 }
    });
    const response = await updateRating(event);
    expect(response.statusCode).toEqual(200);
    await sleep(TIMEOUT);

    //check if photo is also updated
    const photo = await getPhotoById(testPhotoId, testUserId);
    expect(photo.rating).toEqual(1);
}, (TIMEOUT) + 2000);