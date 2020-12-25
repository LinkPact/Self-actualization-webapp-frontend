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
    id: null,
    setUser(user) {
        let loginMessage;
        if (user) {
            loginMessage = user.username + " ID: " + this.id;
        }
        else {
            loginMessage = "Logged out";
        }
        document.getElementById('login_message').textContent = loginMessage;
        console.log(user);
        this.user = user;
    },
    setId(id) {
        this.id = id;
        console.log(id);
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
        });

document
    .getElementById('login_button')
    .addEventListener('click',
        async function() {
            const loginObj = await logIn(
                poolData,
                document.getElementById('email').value,
                document.getElementById('password').value
            );
            const user = loginObj.user;
            const id = loginObj.id;
            cognitoUserObj.setUser(user);
            cognitoUserObj.setId(id);
        });

document
    .getElementById('logout_button')
    .addEventListener('click',
        async function() {
            const user = await logOut(cognitoUserObj.user);
            cognitoUserObj.setUser(user);
        });

document
    .getElementById('verify_button')
    .addEventListener('click',
        async function() {
            const id = verifyCode(
                cognitoUserObj.user,
                document.getElementById('verification_code').value
            );
            cognitoUserObj.setId(id);
        });

// window.onload = async function() {
//     cognitoUserObj.user = await getCurrentLoggedInSession(poolData);
//     console.log(cognitoUserObj.user);
// };


