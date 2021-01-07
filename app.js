const multipart = require("parse-multipart");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const bucket = process.env.BUCKET_NAME

// "exports.handler" must match the entrypoint defined in the lambda Config.
exports.handler = function(event,context,callback){
    console.log(event)
    const bodyBuffer = new Buffer(event['body-json'].toString(),'base64');
    //console.log(event.params.header)
    const boundary = multipart.getBoundary(event.params.header["Content-Type"]);

    const parts = multipart.Parse(bodyBuffer, boundary);
    console.log(parts)
    const uploadFilename = parts[0].filename;
    const uploadBuff = parts[0].data;
    const uploadContetntType = parts[0].type;
    console.log(uploadFilename)
    console.log(uploadContetntType)

    const params = {
        Bucket: bucket,
        Key: uploadFilename, // File name you want to save as in S3
        Body: uploadBuff
    };

    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File ${uploadFilename} uploaded successfully to Bucket ${bucket}.`);
    });

    //let uploadedFile = await promise;
    const signedS3Url = s3.getSignedUrl("getObject", { Bucket: bucket, Key: uploadFilename, Expires: 60000 })


    callback(null,{
        statusCode: 200,
        body: {
            mimeType: uploadContetntType,
            bucket: bucket,
            fileName: uploadFilename,
            originalUrl: signedS3Url,
        }
    });
}