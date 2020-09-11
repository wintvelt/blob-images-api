export const cleanRecord = (record) => {
    let cleanedRecord = { ...record };
    delete cleanedRecord.RK;
    delete cleanedRecord.datePK;
    delete cleanedRecord.dateSK;

    return cleanedRecord;
};