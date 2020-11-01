import { btoa } from 'blob-common/core/base64';
import { dynamoDb } from 'blob-common/core/db';

const webmaster = process.env.webmaster || process.env.devWebmaster;
const allowSignup = (process.env.devAllowSignup && process.env.devAllowSignup === 'true');

const getInvite = async Key => {
    const inviteResult = await dynamoDb.get({
        Key
    });
    return inviteResult.Item;
};

export const main = async (event, context, callback) => {
    const email = event.request.userAttributes.email;
    if (allowSignup || email === webmaster) {
        console.log('allowing signup');
        callback(null, event);
    } else {
        const inviteId = event.request.validationData?.inviteId;
        if (!inviteId) {
            console.log('no invite ID');
            throw new Error('no invite ID provided');
        };

        let Key;
        try {
            Key = JSON.parse(btoa(inviteId));
        } catch (_) {
            console.log('invite ID invalid');
            throw new Error('invite ID invalid');
        }

        const invite = await getInvite(Key);
        console.log({ invite });
        if (!invite) {
            console.log('invite not found');
            throw new Error('invite not found');
        };

        callback(null, event);
    }
};