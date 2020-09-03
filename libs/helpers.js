import { nanoid } from 'nanoid';

// date helpers
const makeStr = (date) => {
    const yyyy = date.getFullYear();
    const m = date.getMonth() + 1;
    const mm = (m < 10) ? '0' + m : '' + m;
    const d = date.getDate();
    const dd = (d < 10) ? '0' + d : '' + d;
    return `${yyyy}-${mm}-${dd}`;
};

export const now = () => makeStr(new Date());

export const expireDate = (dateStr) => {
    let expDate = new Date(dateStr);
    expDate.setDate(expDate.getDate() + 30);
    return makeStr(expDate);
};

// base64 key for invites
export const otob = (object) => Buffer.from(JSON.stringify(object)).toString('base64');
export const btoa = (b) => Buffer.from(b, 'base64').toString();

// random key for secondary index
const PARTS = 15;

export const RND = () => {
    return 'RND' + Math.round(Math.random() * PARTS);
};

export const newPhotoId = () => 'P' + nanoid(15);
export const newGroupId = () => 'G' + nanoid(15);
export const newAlbumId = () => 'A' + nanoid(15);

export const splitArr = (arr, size) => {
    let inArr = [...arr];
    let outArr = [];
    do {
        outArr.push(inArr.slice(0, size));
        inArr = inArr.slice(size);
    } while (inArr.length > 0);
    return outArr;
};