import AWS from "aws-sdk";

var S3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: process.env.photoBucket }
});

const s3 = {
    delete: (params) => S3.deleteObject(params).promise(),
    getMetadata: (params) => S3.headObject(params).promise(),
};

export default s3;