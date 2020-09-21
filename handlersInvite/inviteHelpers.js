import {dynamoDb} from "blob-common/core/db";
import { expireDate, now } from "blob-common/core/date";
import { btoa } from "blob-common/core/base64";

export const getInvite = async (userId, inviteId) => {
    let Key;
    try {
        Key = JSON.parse(btoa(inviteId));
    } catch (_) {
        throw new Error('invite ID invalid');
    }
    // check if invite is for user, if so: must be logged in user
    const inviteIsForAuthUser = (Key.PK.slice(0, 3) === 'UMU') && (!Key.PK.includes('@'));
    if (inviteIsForAuthUser && Key.PK.slice(2) !== userId) throw new Error('invite not for you');

    const params = {
        TableName: process.env.photoTable,
        Key
    };

    const result = await dynamoDb.get(params);
    const invite = result.Item;
    if (!invite) {
        throw new Error("invite not found");
    }
    // check if invite is still an invite
    if (invite.status !== 'invite') throw new Error('invite already accepted');

    // check if invite is still valid
    const expirationDate = expireDate(invite.createdAt);
    if (invite.status === 'invite' && now() > expirationDate) throw new Error('invite expired');

    // Return the retrieved item
    return invite;
};
