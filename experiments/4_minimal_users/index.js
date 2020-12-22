import { getCurrentLoggedInSession, registerUser, logIn } from "../../modules/login.js";

// import "./amazon-cognito-identity"

// import { AmazonCognitoIdentity } from "./amazon-cognito-identity.js";

//=============== AWS IDs ===============
const userPoolId = 'eu-north-1_Txo4RdkuE';
const clientId = '4khr09la8i2o4ftq60via0f1dk';
const region = 'eu-north-1';
const identityPoolId = '<Identity Pool ID>';
//=============== AWS IDs ===============

// var cognitoUser;
// var idToken;
// var userPool;
const poolData = {
    UserPoolId : userPoolId,
    ClientId : clientId
};


document
    .getElementById('register_button')
    .addEventListener('click',
        function() {
            registerUser(
                poolData,
                document.getElementById('email').value,
                document.getElementById('password').value
            )
            // newEntryClick(document.getElementById('goal_input').value)
        });

document
    .getElementById('login_button')
    .addEventListener('click',
        function() {
            logIn(
                poolData,
                document.getElementById('email').value,
                document.getElementById('password').value
            )
            // newEntryClick(document.getElementById('goal_input').value)
        });

getCurrentLoggedInSession(poolData);

