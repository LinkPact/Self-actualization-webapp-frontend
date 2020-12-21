function moduleTestPrint() {
    console.log("Module test print!");
}

function getS3JSON(s3, bucketName, objName) {
    return s3.getObject({
        Bucket: bucketName,
        Key: objName
        // Key: "user1.json"
    }, function(err, data) {
        if (err) {
            console.log(objName + " not found!")
        } else {
            const jsonRaw = data.Body.toString('ascii');
            console.log(jsonRaw);
            console.log(jsonRaw[0]);
            const jsonObj = JSON.parse(jsonRaw);
            console.log(jsonObj);
            return jsonObj;
        }
    });
}

function putS3JSON(s3, bucketName, objName, uploadObject) {
    s3.putObject({
        Bucket: bucketName,
        Key: objName,
        ContentType:'text/plain',
        Body: JSON.stringify(uploadObject)
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("Testing putting object");
        }
    });
}



export { putS3JSON, getS3JSON }
