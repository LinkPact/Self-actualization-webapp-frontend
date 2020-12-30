class UserObject {

    constructor(loginClass, logoutClass, loginStatusId) {
        this.user = null;
        this.id = null;

        this.loginClass = loginClass;
        this.logoutClass = logoutClass;
        this.loginStatusId = loginStatusId;
    }

    registerLoginCompletedFunction(loginCompletedFunc) {
        this.loginCompletedFunction = loginCompletedFunc
    }

    setUser(user) {
        this.user = user;
    }

    setId(id) {
        this.id = id;
        this.loginCompleted();
    }

    getUsername() {
        return this.user.username;
    }

    loginCompleted() {
        console.log(`Assigning json path: ${this.user.username}`);
        // jsonPath = this.user.username;
        this.loginCompletedFunction();
        this.showLoginElements(true);
        document.getElementById(this.loginStatusId).innerText = this.getUsername();
    }

    logout() {
        this.user.signOut();
        this.id = null;
        this.user = null;
        this.showLoginElements(false);
        document.getElementById(this.loginStatusId).innerText = "Logged out";
    }

    showLoginElements(logged_in) {
        const logged_out_elems = document.getElementsByClassName(this.logoutClass);
        const logged_in_elems = document.getElementsByClassName(this.loginClass);

        let login_elems_style;
        let logout_elems_style;
        if (logged_in) {
            login_elems_style = "block";
            logout_elems_style = "none";
        }
        else {
            login_elems_style = "none";
            logout_elems_style = "block";
        }

        for (let i = 0; i < logged_in_elems.length; i++) {
            logged_in_elems[i].style.display = login_elems_style;
        }

        for (let i = 0; i < logged_out_elems.length; i++) {
            logged_out_elems[i].style.display = logout_elems_style;
        }
    }
}

async function registerUser(poolData, cognitoUserObj, email, password) {

    const attributeList = [];
    const dataEmail = {
        Name : 'email',
        Value : email
    };

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    attributeList.push(attributeEmail);

    const user = userPool.signUp(email, password, attributeList, null, function(err, result) {
        if (err) {
            console.log(err.message);
            console.log(err.stack);
        } else {
            console.log('Registration Successful!');
            console.log('Username is: ' + email);
            console.log('Please enter the verification code sent to your Email.');
            alert("An registration email should now have been sent to the entered email, fill in the verification code and click 'Verify code'");
            return result.user;
        }
    });
    cognitoUserObj.setUser(user);
}

async function logIn(poolData, cognitoUserObj, username, password) {

    let idToken = null;
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (!username || !password) {
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
        const user = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUserObj.setUser(user);

        user.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('Logged in!');

                idToken = result.getIdToken().getJwtToken();
                console.log("Printing ID token");
                cognitoUserObj.setId(idToken);
                return true;
            },

            onFailure: function(err) {
                console.log(err.message);
                return false;
            },

        });
    }
}

/*
This method will get temporary credentials for AWS using the IdentityPoolId and the Id Token recieved from AWS Cognito authentication provider.
*/
function getCognitoIdentityCredentials() {
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

async function getCurrentLoggedInUser(poolData) {

    // console.log(poolData);
    const userPool = await new AmazonCognitoIdentity.CognitoUserPool(poolData);
    return userPool.getCurrentUser();
}

/*
If user has logged in before, get the previous session so user doesn't need to log in again.
*/
async function getCurrentLoggedInSession(cognitoUserObj) {

    // const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    // const cognitoUser = userPool.getCurrentUser();

    const cognitoUser = cognitoUserObj.user;
    if (cognitoUser != null){
        cognitoUser.getSession(function(err, session) {
            if (err) {
                console.log(err.message);
            } else {
                console.log('Session found! Logged in.');
                console.log(session);
                const idToken = session.getIdToken().getJwtToken();
                cognitoUserObj.setId(idToken);
                // getCognitoIdentityCredentials();
                // return idToken
            }
            // $("#loader").hide();
        });
    } else {
        console.log('Session expired. Please log in again.');
        // $("#loader").hide();
    }

}

function logOut(cognitoUserObj) {
    if (cognitoUserObj.user != null) {
        cognitoUserObj.logout();
        console.log('Logged out!');
    }
    else {
        console.log("No user logged in");
    }
}

async function verifyCode(cognitoUserObj, verificationCode) {

    const user = cognitoUserObj.user;
    user.confirmRegistration(verificationCode, true, function(err, result) {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Successfully verified code!');
        }
    });
}

export { registerUser, logIn, getCognitoIdentityCredentials,
    getCurrentLoggedInSession, verifyCode, logOut, getCurrentLoggedInUser, UserObject };