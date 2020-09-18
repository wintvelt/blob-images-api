import dynamoDb, { dbUpdate } from '../../libs/dynamodb-lib';
import { eventContext, testUserId, testUser, sleep, setUp, cleanUp } from '../context';
import { main as sendInvite } from '../../handlersInvite/sendInvite';
import { main as acceptInvite } from '../../handlersInvite/acceptInvite';
import { main as getInvite } from '../../handlersInvite/publicGetInvite';
import { main as declineInvite } from '../../handlersInvite/publicDeclineInvite';
import { dbCreateItem } from '../../libs/dynamodb-create-lib';
import { otob } from '../../libs/helpers';

const TIMEOUT = 2000;

const testGroupId = 'Gtest-group-1';
const testGroup = {
    PK: 'GBbase',
    SK: testGroupId,
    name: 'My awesome group'
};
const inviteeMail = 'wintvelt@me.com';
const testUser2Id = 'Utest-user-2';
const testUser2 = { PK: 'UBbase', SK: testUser2Id, email: inviteeMail, name: 'NEW TEST USER' };

const recordList = [
    {
        PK: 'UBbase',
        SK: testUserId,
        ...testUser
    },
    {
        PK: 'GBbase',
        SK: testGroupId,
        group: testGroup,
    },
    {
        PK: 'UM' + testUserId,
        SK: testGroupId,
        user: testUser,
        group: testGroup,
        status: 'active',
        role: 'admin'
    }
];

beforeAll(async () => {
    await setUp(recordList);
    await sleep(TIMEOUT);
}, TIMEOUT + 2000);


afterAll(async () => {
    await sleep(TIMEOUT);
    await cleanUp([
        ...recordList,
        { PK: 'USER', SK: testUserId },
        { PK: 'UBbase', SK: testUser2Id },
        { PK: 'USER', SK: testUser2Id },
        { PK: 'UM' + inviteeMail, SK: testGroupId },
        { PK: 'UM' + testUser2Id, SK: testGroupId },
    ]);
}, TIMEOUT + 3000);

test('Send an invite', async () => {
    const event = eventContext({
        pathParameters: { id: testGroupId },
        body: {
            toName: 'Test Invitee',
            toEmail: inviteeMail,
            message: 'THIS IS A TEST',
            role: 'admin'
        }
    });
    const response = await sendInvite(event);
    expect(response.statusCode).toEqual(200);
}, TIMEOUT + 5000);

const inviteId = otob({ PK: 'UM' + inviteeMail, SK: testGroupId })
const inviteEvent = (userId = 'anonymous user') => eventContext({
    userId,
    pathParameters: { id: inviteId }
});

test('Retrieve an invite', async () => {
    const response = await getInvite(inviteEvent());
    expect(response.statusCode).toEqual(200);
}, TIMEOUT + 5000);

// ONLY WORKS WITH 1 TEST SCENARIO (to prevent multiple invite mails)
describe('Process invite', () => {
    // test('accept email invite for new member', async () => {
    //     await dbCreateItem(testUser2);
    //     await sleep(2000);
    //     const response = await acceptInvite(event);
    //     expect(response.statusCode).toEqual(200);
    // }, TIMEOUT + 3000);
    // test('accept email invite for existing member with lower role', async () => {
    //     await dbCreateItem(testUser2);
    //     await dbCreateItem({
    //         PK: 'UM' + testUser2Id,
    //         SK: testGroupId,
    //         user: testUser2,
    //         group: testGroup,
    //         status: 'active',
    //         role: 'guest'
    //     });
    //     await sleep(TIMEOUT);
    //     const response = await acceptInvite(inviteEvent(testUser2Id));
    //     expect(response.statusCode).toEqual(200);
    // });
    // test('accept email invite for existing member with admin', async () => {
    // });
    // test('accept fail for user invite for existing member', async () => {
    // });
    // test('accept user invite for new member', async () => {
    // });
    test('decline email invite for existing member', async () => {
        await dbCreateItem(testUser2);
        await dbCreateItem({
            PK: 'UM' + testUser2Id,
            SK: testGroupId,
            user: testUser2,
            group: testGroup,
            status: 'active',
            role: 'guest'
        });
        await sleep(TIMEOUT);
        const response = await declineInvite(inviteEvent(testUser2Id));
        expect(response.statusCode).toEqual(200);
    });
}, TIMEOUT + 3000);