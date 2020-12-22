function register(){
    switchToRegisterView();

    if( !$('#emailInput').val() || !$('#userNameInput').val()  || !$('#passwordInput').val() || !$('#confirmPasswordInput').val() ) {
        logMessage('Please fill all the fields!');
    }else{
        if($('#passwordInput').val() == $('#confirmPasswordInput').val()){
            registerUser($('#emailInput').val(), $('#userNameInput').val(), $('#passwordInput').val());
        }else{
            logMessage('Confirm password failed!');
        }

    }
}

function registerUser(poolData, email, password) {
    const attributeList = [];

    const dataEmail = {
        Name : 'email',
        Value : email
    };

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    // $("#loader").show();
    userPool.signUp(email, password, attributeList, null, function(err, result){
        if (err) {
            console.log(err.message);
        } else {
            cognitoUser = result.user;
            console.log('Registration Successful!');
            console.log('Username is: ' + cognitoUser.getUsername());
            console.log('Please enter the verification code sent to your Email.');
            // switchToVerificationCodeView();
        }
        // $("#loader").hide();
    });
}

function logIn(poolData, username, password){

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if(!username || !password){
        logMessage('Please enter Username and Password!');
    } else {
        const authenticationData = {
            Username : username,
            Password : password,
        };
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

        const userData = {
            Username : username,
            Pool : userPool
        };
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        // $("#loader").show();
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('Logged in!');
                // switchToLoggedInView();

                const idToken = result.getIdToken().getJwtToken();
                // getCognitoIdentityCredentials();
            },

            onFailure: function(err) {
                console.log(err.message);
                // $("#loader").hide();
            },

        });
    }
}

/*
This method will get temporary credentials for AWS using the IdentityPoolId and the Id Token recieved from AWS Cognito authentication provider.
*/
function getCognitoIdentityCredentials(){
    AWS.config.region = region;

    var loginMap = {};
    loginMap['cognito-idp.' + region + '.amazonaws.com/' + userPoolId] = idToken;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identityPoolId,
        Logins: loginMap
    });

    AWS.config.credentials.clearCachedId();

    AWS.config.credentials.get(function(err) {
        if (err){
            logMessage(err.message);
        }
        else {
            logMessage('AWS Access Key: '+ AWS.config.credentials.accessKeyId);
            logMessage('AWS Secret Key: '+ AWS.config.credentials.secretAccessKey);
            logMessage('AWS Session Token: '+ AWS.config.credentials.sessionToken);
        }

        $("#loader").hide();
    });
}

/*
If user has logged in before, get the previous session so user doesn't need to log in again.
*/
function getCurrentLoggedInSession(poolData){

    // console.log(AWS);
    // console.log(AmazonCognitoIdentity);
    // $("#loader").show();
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();

    if(cognitoUser != null){
        cognitoUser.getSession(function(err, session) {
            if (err) {
                console.log(err.message);
            } else {
                console.log('Session found! Logged in.');
                // switchToLoggedInView();
                idToken = session.getIdToken().getJwtToken();
                getCognitoIdentityCredentials();
            }
            // $("#loader").hide();
        });
    } else {
        console.log('Session expired. Please log in again.');
        // $("#loader").hide();
    }

}

export { register, registerUser, logIn, getCognitoIdentityCredentials, getCurrentLoggedInSession };