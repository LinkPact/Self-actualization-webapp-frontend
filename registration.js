import {logIn, logOut, registerUser, verifyCode} from "./modules/login.js";
// import {getS3JSON} from "./modules/s3_interaction.js";

console.log("Hello Registration?");

// Setup identity pool
AWS.config.region = 'eu-north-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-north-1:51a3d198-8df4-48b0-bc86-61e12f4539d9',
});

//=============== AWS IDs ===============
const userPoolId = 'eu-north-1_Txo4RdkuE';
const clientId = '4khr09la8i2o4ftq60via0f1dk';
const region = 'eu-north-1';
// const identityPoolId = '<Identity Pool ID>';
//=============== AWS IDs ===============

const poolData = {
    UserPoolId : userPoolId,
    ClientId : clientId
};

let cognitoUserObj = {
    user: null,
    id: null,
    entries: null,
    setUser(user) {
        let loginMessage;
        if (user) {
            loginMessage = user.username;
        }
        else {
            loginMessage = "Logged out";
        }
        // document.getElementById('login_message').textContent = loginMessage;
        this.user = user;
        // updateLoginState(this);
    },
    setId(id) {
        this.id = id;
        console.log(this.user.username);
        this.loginCompleted();
    },
    logout() {
        this.user.signOut();
        this.id = null;
        this.user = null;
    },
    getState() {
        if (!this.user) {
            "Logged out"
        }
        else if (this.user && !this.id) {
            "Unverified"
        }
        else {
            "Logged in"
        }
    }
};

document
    .getElementById('register_button')
    .addEventListener('click',
        async function() {
            await registerUser(
                poolData,
                cognitoUserObj,
                document.getElementById('email').value,
                document.getElementById('password').value
            );
            console.log("RegisterUser function done");
        });

document
    .getElementById('verify_button')
    .addEventListener('click',
        async function() {

            console.log("Before login");
            await logIn(
                poolData,
                cognitoUserObj,
                document.getElementById('email').value,
                document.getElementById('password').value
            );
            console.log("Logged in");
            await verifyCode(
                cognitoUserObj,
                document.getElementById('verification').value
            );
            console.log("Verifycode function done");
        });

