import dynamoDb from '../libs/dynamodb-lib';
import { eventContext, testUserId, testGroupId, testUser,
    sleep, setUp, cleanUp, testPhotoId, testAlbumId } from './context';
import { main as createUser } from '../handlersUser/createUser';
import { main as getUser } from '../handlersUser/getUser';
import { main as updateUser } from '../handlersUser/updateUser';
import { now } from '../libs/helpers';
import { getUserByEmail } from '../libs/dynamodb-lib-user';

const TIMEOUT = 10000;

const testUser2 = 'test-user-2';
const testEmail = 'sjef@test.com';

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

beforeAll(async () => {
    await setUp(recordList);
});

afterAll(async () => {
    await cleanUp(recordList);
    await dynamoDb.delete({
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: 'U' + testUser2,
        }
    });
}, 8000);

test('Create user', async () => {
    const event = eventContext({
        body: { name: 'Other One', email: testEmail },
        cognitoUserId: testUser2
    });
    const response = await createUser(event);
    expect(response.statusCode).toEqual(200);
});
test('Get user', async () => {
    const event = eventContext({
        pathParameters: { id: testUserId }
    });
    const response = await getUser(event);
    const today = now();
    const body = JSON.parse(response.body);
    expect(response.statusCode).toEqual(200);
    expect(body.visitDateLast).toBe(today);
});

test('Get user by email', async () => {
    const userFound = await getUserByEmail(testEmail);
    expect(userFound.email).toBe(testEmail);
});

describe('Change user', () => {
    test('Change username', async () => {
        const event = eventContext({ body: { name: 'Wim' } });
        const response = await updateUser(event);
        expect(response.statusCode).toEqual(200);
        await sleep(TIMEOUT)
    }, TIMEOUT+2000);
    it('membership also updated', async () => {
        const response = await dynamoDb.get({
            TableName: process.env.photoTable,
            Key: {
                PK: 'UM' + testUserId,
                SK: testGroupId
            }
        });
        const membership = response.Item;
        expect(membership?.user?.name).toEqual('Wim');
    }, 2000);
    it('photo also updated', async () => {
        const response = await dynamoDb.get({
            TableName: process.env.photoTable,
            Key: {
                PK: 'PO' + testPhotoId,
                SK: testUserId
            }
        });
        const photo = response.Item;
        expect(photo?.user?.name).toEqual('Wim');
    });
    it('photo publication (group photo) also updated', async () => {
        const response = await dynamoDb.get({
            TableName: process.env.photoTable,
            Key: {
                PK: `GP${testGroupId}#${testAlbumId}`,
                SK: testPhotoId
            }
        });
        const publication = response.Item;
        expect(publication?.photo?.user?.name).toEqual('Wim');
    });
    it('album cover also updated', async () => {
        const response = await dynamoDb.get({
            TableName: process.env.photoTable,
            Key: {
                PK: `GA${testGroupId}`,
                SK: testAlbumId
            }
        });
        const album = response.Item;
        expect(album?.photo?.user?.name).toEqual('Wim');
    });
    it('group cover also updated', async () => {
        const response = await dynamoDb.get({
            TableName: process.env.photoTable,
            Key: {
                PK: 'GBbase',
                SK: testGroupId
            }
        });
        const group = response.Item;
        expect(group?.photo?.user?.name).toEqual('Wim');
    });
}, TIMEOUT+5000);