import AWS from "aws-sdk";

const client = new AWS.SES;

const ses = {
    send: (params) => client.sendEmail(params).promise(),
};

export default ses;