import dynamoDb from '../../libs/dynamodb-lib';
import { eventContext, testUserId, testUser, testPhotoId, sleep, setUp, cleanUp, testAlbumId } from '../context';
import { main as createGroup } from '../../handlersGroup/createGroup';
import { main as updateGroup } from '../../handlersGroup/updateGroup';
import { getMember } from '../../libs/dynamodb-lib-single';

const TIMEOUT = 4000;

const testGroupId = 'test-group-1';
const testGroup = {
    PK: 'GBbase',
    SK: testGroupId,
    name: 'original name'
};

const newGroupName = 'CHANGED to new';
const testGroup2Name = 'ANOTHER TEST GROUP';
// will be created in test
let testGroup2Id = '';

const recordList = [
    {
        PK: 'UBbase',
        SK: testUserId,
        ...testUser
    },
    testGroup,
    {
        PK: 'UM' + testUserId,
        SK: testGroupId,
        group: testGroup,
        user: testUser,
        role: 'admin'
    },
    {
        PK: `GA${testGroupId}`,
        SK: testAlbumId,
        group: testGroup,
    },
    {
        PK: 'PO' + testPhotoId,
        SK: testUserId,
        url: 'dummy'
    },
    {
        PK: 'GA' + testGroupId,
        SK: testAlbumId,
        name: 'TESTALBUM'
    }
];

beforeAll(async () => {
    await setUp(recordList);
});


afterAll(async () => {
    console.log(testGroup2Id);
    await cleanUp([
        ...recordList,
        { PK: 'USER', SK: testUserId },
        { PK: 'GBbase', SK: testGroup2Id },
        { PK: 'UM' + testUserId, SK: testGroup2Id }
    ]);
}, 8000);

test('Create Group with a photo', async () => {
    const event = eventContext({
        body: { name: testGroup2Name, description: 'with a photo', photoId: testPhotoId }
    });
    await sleep(TIMEOUT);
    const response = await createGroup(event);
    expect(response.statusCode).toEqual(200);
    const group = JSON.parse(response.body);
    testGroup2Id = group.SK;
    expect(group.name).toEqual(testGroup2Name);
    expect(group.photo?.PK?.slice(2)).toEqual(testPhotoId);
}, TIMEOUT + 2000);

test('Change group name', async () => {
    const event = eventContext({
        pathParameters: { id: testGroupId },
        body: { name: newGroupName }
    });
    const response = await updateGroup(event);
    expect(response.statusCode).toEqual(200);
    const group = JSON.parse(response.body);
    expect(group.name).toEqual(newGroupName);

    await sleep(4000);
    const membership = await getMember(testUserId, testGroupId);
    expect(membership.group.name).toEqual(newGroupName);

    const albumResponse = await dynamoDb.get({
        TableName: process.env.photoTable,
        Key: { PK: 'GA' + testGroupId, SK: testAlbumId }
    });
    expect(albumResponse.Item?.group?.name).toEqual(newGroupName);

}, 6000);
