const AWS = require('aws-sdk');
const stringSimilarity = require('string-similarity');
const got = require('got');
require('dotenv/config');

const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4'
});

function getS3PreSignedUrl(s3ObjectKey) {

    const bucketName = process.env.S3_PERSISTENCE_BUCKET;
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: s3ObjectKey,
        Expires: 60 * 1 // the Expires is capped for 1 minute
    });
    console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
    return s3PreSignedUrl;

}

module.exports = {
    getS3PreSignedUrl
}