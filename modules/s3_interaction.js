function moduleTestPrint() {
    console.log("Module test print!");
}

async function getS3JSON(s3, bucketName, objName) {

    try {
        const param = {
            Bucket: bucketName,
            Key: objName
        };

        const data = await s3.getObject(param).promise();
        const parsedJSON = JSON.parse(data.Body.toString('utf-8'));
        console.log(`Retrieved JSON object ${parsedJSON} from bucket ${bucketName}, filename ${objName}`);
        return parsedJSON;

    } catch (err) {
        throw new Error("Could not retrieve file from S3: " + err.message);
    }
}

async function putS3JSON(s3, bucketName, objName, uploadObject) {

    try {
        const param = {
            Bucket: bucketName,
            Key: objName,
            ContentType: 'text/plain',
            Body: JSON.stringify(uploadObject)
        };

        console.log(`Storing JSON object ${uploadObject} to S3 bucket ${bucketName}, file ${objName}`);
        s3.putObject(param).promise();
    } catch (err) {
        throw new Error("Could not put file to S3: " + err.message);
    }

    // s3.putObject({
    //     Bucket: bucketName,
    //     Key: objName,
    //     ContentType:'text/plain',
    //     Body: JSON.stringify(uploadObject)
    // }, function(err, data) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log("Testing putting object");
    //     }
    // });
}



export { putS3JSON, getS3JSON }
