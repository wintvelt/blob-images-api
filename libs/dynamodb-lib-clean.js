// remove internal stuff before sending as API output
export const cleanRecord = (record) => {
    let cleanedRecord = { ...record };
    delete cleanedRecord.RK;
    delete cleanedRecord.datePK;
    delete cleanedRecord.dateSK;
    delete cleanedRecord.cognitoId;

    return cleanedRecord;
};