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

function registerUser(email, username, password){
    var attributeList = [];

    var dataEmail = {
        Name : 'email',
        Value : email
    };

    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    $("#loader").show();
    userPool.signUp(username, password, attributeList, null, function(err, result){
        if (err) {
            logMessage(err.message);
        }else{
            cognitoUser = result.user;
            logMessage('Registration Successful!');
            logMessage('Username is: ' + cognitoUser.getUsername());
            logMessage('Please enter the verification code sent to your Email.');
            switchToVerificationCodeView();
        }
        $("#loader").hide();
    });
}

function logIn(){

    if(!$('#userNameInput').val() || !$('#passwordInput').val()){
        logMessage('Please enter Username and Password!');
    }else{
        var authenticationData = {
            Username : $('#userNameInput').val(),
            Password : $("#passwordInput").val(),
        };
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

        var userData = {
            Username : $('#userNameInput').val(),
            Pool : userPool
        };
        cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        $("#loader").show();
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                logMessage('Logged in!');
                switchToLoggedInView();

                idToken = result.getIdToken().getJwtToken();
                getCognitoIdentityCredentials();
            },

            onFailure: function(err) {
                logMessage(err.message);
                $("#loader").hide();
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
function getCurrentLoggedInSession(){

    // console.log(AWS);
    // console.log(AmazonCognitoIdentity);
    // $("#loader").show();
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    cognitoUser = userPool.getCurrentUser();

    if(cognitoUser != null){
        cognitoUser.getSession(function(err, session) {
            if (err) {
                logMessage(err.message);
            }else{
                logMessage('Session found! Logged in.');
                switchToLoggedInView();
                idToken = session.getIdToken().getJwtToken();
                getCognitoIdentityCredentials();
            }
            $("#loader").hide();
        });
    }else{
        logMessage('Session expired. Please log in again.');
        $("#loader").hide();
    }

}

export { register, registerUser, logIn, getCognitoIdentityCredentials, getCurrentLoggedInSession };