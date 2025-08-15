const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

function isEnabled() {
  return process.env.S3_ENABLED === 'true';
}

function getClient() {
  const { S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
  const s3 = new AWS.S3({
    region: S3_REGION,
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  });
  return s3;
}

function getBucketAndKey(key) {
  const bucket = process.env.S3_BUCKET;
  const prefix = process.env.S3_PREFIX || '';
  const Key = path.posix.join(prefix, key);
  return { Bucket: bucket, Key };
}

async function uploadJSON(key, json) {
  if (!isEnabled()) throw new Error('S3 not enabled');
  const s3 = getClient();
  const params = { ...getBucketAndKey(key), Body: JSON.stringify(json), ContentType: 'application/json' };
  await s3.putObject(params).promise();
}

async function downloadJSON(key) {
  if (!isEnabled()) throw new Error('S3 not enabled');
  const s3 = getClient();
  const obj = await s3.getObject(getBucketAndKey(key)).promise();
  return JSON.parse(obj.Body.toString('utf-8'));
}

async function uploadFile(key, filePath) {
  if (!isEnabled()) throw new Error('S3 not enabled');
  const s3 = getClient();
  const Body = fs.createReadStream(filePath);
  await s3.upload({ ...getBucketAndKey(key), Body }).promise();
}

async function getSignedUrl(key, expires = 3600) {
  if (!isEnabled()) throw new Error('S3 not enabled');
  const s3 = getClient();
  return s3.getSignedUrlPromise('getObject', { ...getBucketAndKey(key), Expires: expires });
}

module.exports = {
  isEnabled,
  uploadJSON,
  downloadJSON,
  uploadFile,
  getSignedUrl,
};
