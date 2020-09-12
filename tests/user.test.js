import dynamoDb from '../libs/dynamodb-lib';
import { eventContext, testUserId, setUp, cleanUp, testGroupId, sleep, testPhotoId, testAlbumId } from './context';
import { main as createUser } from '../handlersUser/createUser';
import { main as getUser } from '../handlersUser/getUser';
import { main as updateUser } from '../handlersUser/updateUser';
import { now } from '../libs/helpers';
import { getUserByEmail } from '../libs/dynamodb-lib-user';

const testUser2 = 'test-user-2';
const testEmail = 'sjef@test.com';

beforeAll(async () => {
    await setUp();
});

afterAll(async () => {
    await cleanUp();
    await dynamoDb.delete({
        TableName: process.env.photoTable,
        Key: {
            PK: 'UBbase',
            SK: 'U' + testUser2,
        }
    });
});

test('Create user', async () => {
    const event = eventContext({
        body: { name: 'Other One', email: testEmail },
        cognitoUserId: testUser2
    });
    const response = await createUser(event);
    expect(response.statusCode).toEqual(200);
});

describe('Change user and propagate to membership, photos, albums, groups', () => {
    test('Change username', async () => {
        const event = eventContext({ body: { name: 'Wim' } });
        const response = await updateUser(event);
        expect(response.statusCode).toEqual(200);
    });
    it('membership also updated', async () => {
        await sleep(4000);
        const response = await dynamoDb.get({
            TableName: process.env.photoTable,
            Key: {
                PK: 'UM' + testUserId,
                SK: testGroupId
            }
        });
        const membership = response.Item;
        expect(membership?.user?.name).toEqual('Wim');
    }, 6000);
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
    it('album photo also updated', async () => {
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
    it('group photo also updated', async () => {
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
}, 10000);

test('Get user', async () => {
    const event = eventContext({
        pathParameters: { id: testUserId }
    });
    const response = await getUser(event);
    const today = now();
    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.visitDateLast).toBe(today);
});

test('Get user by email', async () => {
    const userFound = await getUserByEmail(testEmail);
    expect(userFound.email).toBe(testEmail);
})