import { getCurrentLoggedInSession, registerUser, logIn, logOut, verifyCode }
from "../../modules/login.js";

// import "./amazon-cognito-identity"
// import { AmazonCognitoIdentity } from "./amazon-cognito-identity.js";

//=============== AWS IDs ===============
const userPoolId = 'eu-north-1_Txo4RdkuE';
const clientId = '4khr09la8i2o4ftq60via0f1dk';
const region = 'eu-north-1';
// const identityPoolId = '<Identity Pool ID>';
//=============== AWS IDs ===============

let cognitoUserObj = {
    user: null,
    setUser(user) {
        // refreshLoginStatus();
        let loginMessage;
        if (user) {
            loginMessage = user.username;
        }
        else {
            loginMessage = "Logged out";
        }
        document.getElementById('login_message').textContent = loginMessage;
        // console.log(user.fetchUserData());
        console.log(user);
        this.user = user;
    }
};

const poolData = {
    UserPoolId : userPoolId,
    ClientId : clientId
};

document
    .getElementById('register_button')
    .addEventListener('click',
        function() {
            const user = registerUser(
                poolData,
                document.getElementById('email').value,
                document.getElementById('password').value
            );
            cognitoUserObj.setUser(user);
            // console.log(cognitoUserObj.user);
            // newEntryClick(document.getElementById('goal_input').value)
        });

document
    .getElementById('login_button')
    .addEventListener('click',
        async function() {
            const user = await logIn(
                poolData,
                document.getElementById('email').value,
                document.getElementById('password').value
            );
            cognitoUserObj.setUser(user);

            // console.log(cognitoUserObj.user);
            // console.log(cognitoUserObj.user.username);
            // newEntryClick(document.getElementById('goal_input').value)
        });

document
    .getElementById('logout_button')
    .addEventListener('click',
        async function() {
            // console.log(cognitoUser);
            const user = await logOut(cognitoUserObj.user);
            cognitoUserObj.setUser(user);
            // console.log(cognitoUserObj.user);
            // newEntryClick(document.getElementById('goal_input').value)
        });

document
    .getElementById('verify_button')
    .addEventListener('click',
        async function() {
            verifyCode(
                cognitoUserObj.user,
                document.getElementById('verification_code').value
            )
            // newEntryClick(document.getElementById('goal_input').value)
        });

// window.onload = async function() {
//     cognitoUserObj.user = await getCurrentLoggedInSession(poolData);
//     console.log(cognitoUserObj.user);
// };


