import { nanoid } from 'nanoid';

const PARTS = 15;

export const now = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const m = today.getMonth() + 1;
    const mm = (m < 10) ? '0' + m : '' + m;
    const d = today.getDate();
    const dd = (d < 10) ? '0' + d : '' + d;
    return `${yyyy}-${mm}-${dd}`;
};

export const RND = () => {
    return 'RND' + Math.round(Math.random() * PARTS);
};

export const newPhotoId = () => 'P' + nanoid(12);
export const newGroupId = () => 'G' + nanoid(12);
export const newAlbumId = () => 'A' + nanoid(12);

export const splitArr = (arr, size) => {
    let inArr = [...arr];
    let outArr = [];
    do {
        outArr.push(inArr.slice(0, size));
        inArr = inArr.slice(size);
    } while (inArr.length > 0);
    return outArr;
};