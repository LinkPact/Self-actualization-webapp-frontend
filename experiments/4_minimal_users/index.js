import { getCurrentLoggedInSession } from "../../modules/login.js";

// import "./amazon-cognito-identity"

// import { AmazonCognitoIdentity } from "./amazon-cognito-identity.js";

//=============== AWS IDs ===============
const userPoolId = 'eu-north-1_Txo4RdkuE';
const clientId = '7abl1ignhustq5ettdudmrkmn1';
const region = 'eu-north-1';
const identityPoolId = '<Identity Pool ID>';
//=============== AWS IDs ===============

var cognitoUser;
var idToken;
var userPool;

const poolData = {
    UserPoolId : userPoolId,
    ClientId : clientId
};

getCurrentLoggedInSession();

