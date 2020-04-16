const PHOTO_PARTS = 15;

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
    return 'RND' + Math.round(Math.random() * PHOTO_PARTS);
};