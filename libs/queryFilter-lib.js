// takes a queryString Object, to apply filters to an object
/*
    Allowed parameters
    * naked variable name or name[eq]: checks equality
    * name[contains]: checks if value contains the substring
    * name[gt], name[lt]: checks greater than, less than
    * name[ge], name[le]: greater than or equal, less than or equal
    * name[ne]: not equal
    Allowed values
    * single string
    * comma separated with [eq] or [contains]: will pass if 1 or more of values applies
    * comma separated with [ne]: will pass if none of the values applies
*/

// extracts nakedKey and operation from name[operation] string
export const extractOperation = (key) => {
    const opPosition = key.indexOf('[');
    if (opPosition === -1) return [key, 'eq'];
    return [
        key.slice(0, opPosition),
        key.slice(opPosition + 1, -1)
    ];
};

// checks value or values for single operation
const applyOp = (operation, value, objectValue) => {
    switch (operation) {
        case 'gt': {
            return objectValue > value;
        }
        case 'lt': {
            return objectValue < value;
        }
        case 'ge': {
            return objectValue >= value;
        }
        case 'le': {
            return objectValue <= value;
        }
        case 'ne': {
            const values = value.split(',');
            let singlePass = true;
            values.forEach(val => {
                singlePass = singlePass && objectValue !== val;
            });
            return singlePass;
        }
        case 'contains': {
            const values = value.split(',');
            let singlePass = false;
            values.forEach(val => {
                singlePass = singlePass || objectValue.includes(val);
            });
            return singlePass;
        }
        default: {
            // equal
            const values = value.split(',');
            let singlePass = false;
            values.forEach(val => {
                singlePass = singlePass || objectValue === val;
            });
            return singlePass;
        }
    };
}

// MAIN FUNCTION
export const filterFromQuery = (queryStringObj) => (object) => {
    let pass = true;
    const keys = Object.keys(queryStringObj);
    const keyCount = keys.length;
    for (let i = 0; i < keyCount; i++) {
        const key = keys[i];
        const [nakedKey, operation] = extractOperation(key);
        if (nakedKey !== 'sort') {
            const value = queryStringObj[key].toLowerCase();
            const objectValue = object[nakedKey].toLowerCase();
            pass = pass && applyOp(operation, value, objectValue);
        }
    };
    return pass;
};