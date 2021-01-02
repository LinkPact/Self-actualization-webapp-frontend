import { logIn, registerUser, verifyCode, UserObject, resendVerification } from './modules/login.js'

// Setup identity pool
AWS.config.region = 'eu-north-1' // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-north-1:51a3d198-8df4-48b0-bc86-61e12f4539d9'
})

//= ============== AWS IDs ===============
const userPoolId = 'eu-north-1_Txo4RdkuE'
const clientId = '4khr09la8i2o4ftq60via0f1dk'
//= ============== AWS IDs ===============

const poolData = {
    UserPoolId: userPoolId,
    ClientId: clientId
}

const cognitoUserObj = new UserObject()

document
    .getElementById('register_button')
    .addEventListener('click',
        async function () {

            const email = document.getElementById('email').value
            const password = document.getElementById('password').value

            if (email && password) {
                await registerUser(
                    poolData,
                    cognitoUserObj,
                    email,
                    password
                )
                console.log('RegisterUser function done')
            }
            else {
                alert('You need to enter both email and password to register a new user')
            }
        })

document
    .getElementById('verify_button')
    .addEventListener('click',
        async function () {

            const email = document.getElementById('email').value
            const password = document.getElementById('password').value
            const verification = document.getElementById('verification').value

            if (email && password && verification) {
                await logIn(
                    poolData,
                    cognitoUserObj,
                    email,
                    password
                )
                console.log('Logged in prior to verification')
                await verifyCode(
                    cognitoUserObj,
                    verification
                )
                console.log('Verifycode function done')
            }
            else {
                alert('Email, password and verification code needs to be entered for verification')
            }
        })

document
    .getElementById('resend_button')
    .addEventListener('click',
        async function () {

            const email = document.getElementById('email').value
            // const password = document.getElementById('password').value

            if (email && password) {
                await resendVerification(
                    poolData,
                    cognitoUserObj,
                    email,
                    (username) => {
                        alert(`If there is an account for the email ${username} a verification message has been sent there`)
                    }
                    // password
                )
            }
            else {
                alert('Email needs to be present!')
            }
        })