import { logIn, registerUser, verifyCode, UserObject } from './modules/login.js'

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
            await registerUser(
                poolData,
                cognitoUserObj,
                document.getElementById('email').value,
                document.getElementById('password').value
            )
            console.log('RegisterUser function done')
        })

document
    .getElementById('verify_button')
    .addEventListener('click',
        async function () {
            console.log('Before login')
            await logIn(
                poolData,
                cognitoUserObj,
                document.getElementById('email').value,
                document.getElementById('password').value
            )
            console.log('Logged in')
            await verifyCode(
                cognitoUserObj,
                document.getElementById('verification').value
            )
            console.log('Verifycode function done')
        })
