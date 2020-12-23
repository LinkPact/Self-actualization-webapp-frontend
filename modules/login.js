// function register(){
//     switchToRegisterView();
//
//     if( !$('#emailInput').val() || !$('#userNameInput').val()  || !$('#passwordInput').val() || !$('#confirmPasswordInput').val() ) {
//         logMessage('Please fill all the fields!');
//     }else{
//         if($('#passwordInput').val() == $('#confirmPasswordInput').val()){
//             registerUser($('#emailInput').val(), $('#userNameInput').val(), $('#passwordInput').val());
//         }else{
//             logMessage('Confirm password failed!');
//         }
//
//     }
// }

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
            console.log('Registration Successful!');
            console.log('Username is: ' + cognitoUser.getUsername());
            console.log('Please enter the verification code sent to your Email.');
            return result.user;
            // switchToVerificationCodeView();
        }
        // $("#loader").hide();
    });
}

async function logIn(poolData, username, password){

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if(!username || !password) {
        console.log('Please enter Username and Password!');
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
        return new AmazonCognitoIdentity.CognitoUser(userData);

        // $("#loader").show();
        // cognitoUser.authenticateUser(authenticationDetails, {
        //     onSuccess: function (result) {
        //         console.log('Logged in!');
        //         // switchToLoggedInView();
        //
        //         const idToken = result.getIdToken().getJwtToken();
        //         // getCognitoIdentityCredentials();
        //     },
        //
        //     onFailure: function(err) {
        //         console.log(err.message);
        //         // $("#loader").hide();
        //     },
        //
        // });
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
            console.log(err.message);
        }
        else {
            console.log('AWS Access Key: '+ AWS.config.credentials.accessKeyId);
            console.log('AWS Secret Key: '+ AWS.config.credentials.secretAccessKey);
            console.log('AWS Session Token: '+ AWS.config.credentials.sessionToken);
        }

        // $("#loader").hide();
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
                console.log(session);
                // switchToLoggedInView();
                const idToken = session.getIdToken().getJwtToken();
                // getCognitoIdentityCredentials();
            }
            // $("#loader").hide();
        });
    } else {
        console.log('Session expired. Please log in again.');
        // $("#loader").hide();
    }

}

function logOut(user) {
    if (user != null) {

        // $("#loader").show();
        user.signOut();
        // switchToLogInView();
        console.log('Logged out!');
        // $("#loader").hide();
    }
    else {
        console.log("No user logged in");
    }
}

function verifyCode(verificationCode) {

    cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
        if (err) {
            logMessage(err.message);
        }else{
            console.log('Successfully verified code!');
            // switchToLogInView();
        }

        // $("#loader").hide();
    });
    // }
}

export { registerUser, logIn, getCognitoIdentityCredentials,
    getCurrentLoggedInSession, verifyCode, logOut };