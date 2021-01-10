const multipart = require("parse-multipart");
const AWS = require("aws-sdk");
const sharp = require('sharp');
const s3 = new AWS.S3();

const bucket = process.env.BUCKET_NAME

exports.lambdaHandler = function(event,context,callback){
    console.log(event)
    const bodyBuffer = new Buffer(event['body'].toString(),'base64');
    const boundary = multipart.getBoundary(event.headers["Content-Type"]);

    const parts = multipart.Parse(bodyBuffer, boundary);
    console.log(parts)
    const uploadFilename = parts[0].filename;
    const uploadBuff = parts[0].data;
    const uploadContetntType = parts[0].type;

    const params = {
        Bucket: bucket,
        Key: uploadFilename,
        Body: uploadBuff
    };

    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File ${uploadFilename} uploaded successfully to Bucket ${bucket}.`);
    });

    const resizedImageBuff = sharp(uploadBuff).resize(270, 180);

    const resizedParams ={
        Bucket: bucket,
        Key: "resized/" + uploadFilename,
        Body: resizedImageBuff
    }

    s3.upload(resizedParams, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`Resized File ${uploadFilename} uploaded successfully to Bucket ${bucket}/resized.`);
    });

    const imgSignedS3Url = s3.getSignedUrl("getObject", { Bucket: bucket, Key: uploadFilename, Expires: 60000 })

    const resizedImgsignedS3Url = s3.getSignedUrl("getObject", { Bucket: bucket, Key: "resized/" + uploadFilename, Expires: 60000 })

    const responseBody = {
        "bucket": bucket,
        "mimeType": uploadContetntType,
        "fileName": uploadFilename,
        "signedUrl": imgSignedS3Url,
        "resizedImageSignedUrl": resizedImgsignedS3Url
    };

    callback(null,{
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify(responseBody)
    });
}