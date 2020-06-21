// to sort based on query parameters
/*
    takes a query Object with a sort key, e.g.
    * sort[asc]=name
    * sort=name
    * sort[desc]=date
*/
import { extractOperation } from './queryFilter-lib';

export const sortFromQuery = (queryStringObj) => (a, b) => {
    const key = (queryStringObj.sort && 'sort')
        || (queryStringObj['sort[asc]'] && 'sort[asc]')
        || (queryStringObj['sort[desc]'] && 'sort[desc]');
    if (!key) return 0;
    const [_, operation] = extractOperation(key);
    const sortKey = queryStringObj[key];
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    const compareAsc = (aValue < bValue) ? -1 :
        (bValue < aValue) ? 1 : 0;
    return (operation === 'desc') ? -compareAsc : compareAsc;
};