import { getCurrentLoggedInSession, registerUser, logIn, logOut, verifyCode,
    getCurrentLoggedInUser }
from "../../modules/login.js";
import { getS3JSON, putS3JSON } from "../../modules/s3_interaction.js";

// import "./amazon-cognito-identity"
// import { AmazonCognitoIdentity } from "./amazon-cognito-identity.js";

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

const s3 = new AWS.S3();

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
        document.getElementById('login_message').textContent = loginMessage;
        // console.log(user);
        this.user = user;
        updateLoginState(this);
    },
    setId(id) {
        this.id = id;
        // console.log(id);
        updateLoginState(this);
        console.log(this.user.username);
        this.loginCompleted();
    },
    async loginCompleted() {
        const loadedEntries = await getS3JSON(s3, s3BucketName, cognitoUserObj.user.username);
        currentEntries = loadedEntries;
        updateHabitsDisplay(currentEntries);
    },
    // setEntries(entries) {
    //     this.entries = entries;
    //     updateHabitsDisplay(entries);
    // },
    logout() {
        this.user.signOut();
        this.id = null;
        this.user = null;
        updateLoginState(this);
        currentEntries = [];
        updateHabitsDisplay(currentEntries);
    }
};

let currentEntries = ["[Placeholder entry]"];

function updateHabitsDisplay(entries) {
    const listElem = document.getElementById("habits_list");
    listElem.innerHTML = "";

    entries.forEach(function(entry) {
        const newItem = document.createElement('li');
        newItem.appendChild(document.createTextNode(entry));
        listElem.appendChild(newItem);
    });
}

function updateLoginState(userObj) {

    // console.log(`Updating login state with user: ${userObj.user} and ID ${userObj.id}`);

    if (!userObj.user && !userObj.id) {
        document.getElementById('register_button').style.display = "block";
        document.getElementById('login_button').style.display = "block";
        document.getElementById('logout_button').style.display = "none";
        document.getElementById('verify_button').style.display = "none";
        document.getElementById('verification').style.display = "none";
    }
    else if (userObj.user && !userObj.id) {
        document.getElementById('register_button').style.display = "none";
        document.getElementById('login_button').style.display = "none";
        document.getElementById('logout_button').style.display = "block";
        document.getElementById('verify_button').style.display = "block";
        document.getElementById('verification').style.display = "block";
    }
    else {
        document.getElementById('register_button').style.display = "none";
        document.getElementById('login_button').style.display = "none";
        document.getElementById('logout_button').style.display = "block";
        document.getElementById('verify_button').style.display = "none";
        document.getElementById('verification').style.display = "none";

    }
}

const poolData = {
    UserPoolId : userPoolId,
    ClientId : clientId
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
        });

document
    .getElementById('login_button')
    .addEventListener('click',
        async function() {
            logIn(
                poolData,
                cognitoUserObj,
                document.getElementById('email').value,
                document.getElementById('password').value
            )
        });

document
    .getElementById('logout_button')
    .addEventListener('click',
        async function() {
            await logOut(cognitoUserObj);
        });

document
    .getElementById('verify_button')
    .addEventListener('click',
        async function() {
            await verifyCode(
                cognitoUserObj,
                document.getElementById('verification_code').value
            );
        });

// document
//     .getElementById('refresh_button')
//     .addEventListener('click',
//         async function() {
//             await getCurrentLoggedInSession(cognitoUserObj);
//         });

const s3BucketName = 'selfactualizationtest';
document
    .getElementById('create_bucket_button')
    .addEventListener('click',
        function() {
            console.log("Create bucket object button clicked");
            putS3JSON(s3, s3BucketName, cognitoUserObj.user.username, ["testcontent"]);
        });

document
    .getElementById('list_bucket_button')
    .addEventListener('click',
        async function() {
            console.log("List bucket object button clicked");
            const output = await getS3JSON(s3, s3BucketName, cognitoUserObj.user.username);
            console.log(output);
        });

document
    .getElementById('testprint')
    .addEventListener('click',
        async function() {
            console.log(cognitoUserObj);
        });

document
    .getElementById('newentry')
    .addEventListener('click',
        async function() {
            console.log("New entry click");
            const currText = document.getElementById('newentry_text').value;
            document.getElementById('newentry_text').value = "";
            currentEntries.push(currText);
            updateHabitsDisplay(currentEntries);

            let jsonPath;
            if (cognitoUserObj.user && cognitoUserObj.user.username) {
                jsonPath = cognitoUserObj.user.username;
            }
            else {
                jsonPath = "default.json";
            }

            putS3JSON(s3, s3BucketName, jsonPath, currentEntries);
        });

document
    .getElementById('clear_entries')
    .addEventListener('click',
        async function() {
            console.log("Clear entries");
            currentEntries = [];
            putS3JSON(s3, s3BucketName, "default.json", currentEntries);
            updateHabitsDisplay(currentEntries);
        });

document
    .getElementById('refresh_entries')
    .addEventListener('click',
        async function()  {
            console.log("Refresh entries");
            const loadedEntries = await getS3JSON(s3, s3BucketName, cognitoUserObj.user.username);
            console.log(currentEntries);
            if (loadedEntries) {
                currentEntries = loadedEntries;
            }
            updateHabitsDisplay(currentEntries);
        });

window.onload = async function() {
    // cognitoUserObj.user = await getCurrentLoggedInSession(poolData);
    updateLoginState(cognitoUserObj);
};


