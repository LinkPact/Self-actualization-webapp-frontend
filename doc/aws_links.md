# Working with S3 object storage

Access through browser
https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photos-view.html

# AWS services used

* Cognito for identify management
* S3 for object storage
* IAM - Identity Access Management
* CORS - Cross Origin Resource Sharing, defined was for clients in one domain to interact with clients in other domains
    * Allows cross-referencing resources to access S3

# AWS credentials

* Allowing the SDK to access the credentials from the environment
https://stackoverflow.com/questions/61028751/missing-credentials-in-config-if-using-aws-config-file-set-aws-sdk-load-config

# User managemnet

* Using Cognito for keeping track of users: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html
* Demo: https://1billiontech.com/blog_User_Authentication_and_Authorization_with_AWS_Cognito.php
