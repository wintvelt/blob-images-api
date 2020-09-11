export const cleanRecord = (record) => {
    let cleanedRecord = { ...record };
    delete cleanRecord.RK;
    delete cleanRecord.datePK;
    delete cleanRecord.dateSK;

    return cleanedRecord;
};