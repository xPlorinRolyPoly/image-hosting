const AWS = require("aws-sdk");
const sharp = require('sharp');
const parser = require('lambda-multipart-parser');
const Joi = require('joi');
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.BUCKET_NAME;
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

let response = {
    "isBase64Encoded": false,
    "headers": {
        "Content-Type": "application/json"
    }
}

exports.lambdaHandler = async function(event){
    try {
        console.log(event);
        const parsedEvent = await parser.parse(event);
        console.log('Result:', parsedEvent);
        let resp = validateBody(parsedEvent);
        if(isValidResponse(resp.statusCode)) {
            const uploadContentType = parsedEvent.files[0].contentType;
            const uploadBuff = parsedEvent.files[0].content;
            const uploadFilename = parsedEvent.files[0].filename;

            const resizedImageBuff = sharp(uploadBuff).resize(200, 200, {
                fit: sharp.fit.fill
            });
            const originalImage = await uploadImage("images/" + uploadFilename, uploadBuff);
            const resizedImage = await uploadImage("images/resized/" + uploadFilename, resizedImageBuff);
            let responseBody = {
                "bucket": BUCKET_NAME,
                "mimeType": uploadContentType,
                "fileName": uploadFilename,
                "imageUrl": originalImage.Location,
                "resizedImageUrl": resizedImage.Location
            }
            response.body = JSON.stringify(responseBody);
            response.statusCode = 201;
        }
    } catch (error) {
        console.log(error);
    }

    return response;
}

async function uploadImage(bucketKey, bufferData) {
    let respData = null;
    const params = {
        ACL: "public-read",
        Bucket: BUCKET_NAME,
        Key: bucketKey,
        Body: bufferData
    };
    console.log(params);
    try {
        respData = await s3.upload(params).promise();
        console.log(respData);
    } catch (error) {
        console.log(error);
    }
    return respData;
}

function isValidResponse(statusCode){
    return parseInt(statusCode) == 200;
}

function validateBody(parsedEvent){
    const bodySchema = Joi.object({
        files: Joi.array().max(1).min(1).required()
    });
    let { error } = bodySchema.validate(parsedEvent);

    let responseBody = {};
    if ( error ){
        responseBody = {
            "status": "Error: Bad request body",
            "message": error.details[0].message
        };
        response.body = JSON.stringify(responseBody);
        response.statusCode = 400;
        return response;
    }

    const contentType = parsedEvent.files[0].contentType;
    if ( !VALID_IMAGE_TYPES.includes(contentType) ){
        const search = ',';
        const replacer = new RegExp(search, 'g');
        responseBody = {
            "status": "Error: Bad request body",
            "message": "\"file\" must be of type " + VALID_IMAGE_TYPES.toString().replace(replacer, ' or ')
        };
        response.body = JSON.stringify(responseBody);
        response.statusCode = 400;
        return response;
    }
    response.statusCode = 200;
    return response;
}