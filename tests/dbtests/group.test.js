import dynamoDb from '../../libs/dynamodb-lib';
import { eventContext, testUserId, testUser, testPhotoId, sleep, setUp, cleanUp, testAlbumId } from '../context';
import { main as createGroup } from '../../handlersGroup/createGroup';
import { main as updateGroup } from '../../handlersGroup/updateGroup';
import { main as listGroups } from '../../handlersGroup/listGroups';
import { main as listMembers } from '../../handlersGroup/listMembers';
import { main as updateMembership } from '../../handlersGroup/updateMembership';
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
let testGroup2Id = 'empty';

const testUser2Id = 'test-user2';
const testUser2 = { name: 'another member' };

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
    },
    {
        PK: 'UBbase',
        SK: testUser2Id,
        ...testUser2
    },
    {
        PK: 'UM' + testUser2Id,
        SK: testGroupId,
        group: testGroup,
        user: testUser2,
        role: 'guest'
    }
];

beforeAll(async () => {
    await setUp(recordList);
});


afterAll(async () => {
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

test('List user groups (memberships)', async () => {
    const event = eventContext();
    const response = await listGroups(event);
    expect(response.statusCode).toEqual(200);
    const memberships = JSON.parse(response.body);
    expect(memberships[0].userRole).toBe('admin');
});

test('List all members of a group', async () => {
    const event = eventContext({
        pathParameters: { id: testGroupId },
    });
    const response = await listMembers(event);
    expect(response.statusCode).toEqual(200);
    const members = JSON.parse(response.body);
    expect(members.length).toEqual(2);
    expect(members[0]).toHaveProperty('role');
});

test('Update role of a member', async () => {
    const event = eventContext({
        pathParameters: { id: testGroupId, memberid: testUser2Id },
        body: { newRole: 'admin' },
    });
    const response = await updateMembership(event);
    expect(response.statusCode).toEqual(200);

    const changedMember = await getMember(testUser2Id, testGroupId);
    console.log(changedMember);
});