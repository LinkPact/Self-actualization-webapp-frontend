const userPoolId = 'eu-north-1_Txo4RdkuE'
const clientId = '4khr09la8i2o4ftq60via0f1dk'

class AwsInteraction {
    constructor () {
        AWS.config.region = 'eu-north-1' // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-north-1:51a3d198-8df4-48b0-bc86-61e12f4539d9'
        })
    }

    setupS3 () {
        const s3 = new AWS.S3()
        return s3
    }

    getPoolData () {
        const poolData = {
            UserPoolId: userPoolId,
            ClientId: clientId
        }
        return poolData
    }
}

export { AwsInteraction }
