class UserObject {
    constructor (loginClass = null, logoutClass = null, loginStatusId = null) {
        this.user = null
        this.id = null

        this.loginClass = loginClass
        this.logoutClass = logoutClass
        this.loginStatusId = loginStatusId
    }

    registerLoginCompletedFunction (loginCompletedFunc) {
        this.loginCompletedFunction = loginCompletedFunc
    }

    setUser (user) {
        this.user = user
    }

    setId (id) {
        this.id = id
        this.loginCompleted()
    }

    getUsername () {
        return this.user.username
    }

    loginCompleted () {
        console.log(`Assigning json path: ${this.user.username}`)

        if (this.loginCompletedFunction) {
            this.loginCompletedFunction()
        }
        else {
            console.log("No login completion function specified, skippig...")
        }

        this.showLoginElements(true)
        if (this.loginStatusId) {
            document.getElementById(this.loginStatusId).innerText = this.getUsername()
        }
    }

    logout () {
        this.user.signOut()
        this.id = null
        this.user = null
        this.showLoginElements(false)
        if (this.loginStatusId) {
            document.getElementById(this.loginStatusId).innerText = 'Logged out'
        }
    }

    showLoginElements (loggedIn) {
        const loggedOutElems = document.getElementsByClassName(this.logoutClass)
        const loggedInElems = document.getElementsByClassName(this.loginClass)

        let loginElemsStyle
        let logoutElemsStyle
        if (loggedIn) {
            loginElemsStyle = 'block'
            logoutElemsStyle = 'none'
        } else {
            loginElemsStyle = 'none'
            logoutElemsStyle = 'block'
        }

        for (let i = 0; i < loggedInElems.length; i++) {
            loggedInElems[i].style.display = loginElemsStyle
        }

        for (let i = 0; i < loggedOutElems.length; i++) {
            loggedOutElems[i].style.display = logoutElemsStyle
        }
    }
}

async function registerUser (poolData, cognitoUserObj, email, password) {

    const attributeList = []
    const dataEmail = {
        Name: 'email',
        Value: email
    }

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)
    const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail)
    console.log(attributeEmail)
    attributeList.push(attributeEmail)

    const user = userPool.signUp(email, password, attributeList, null, function (err, result) {
        if (err) {
            alert(err.message)
            // console.log(err.stack)
        } else {
            console.log('Registration Successful!')
            console.log('Username is: ' + email)
            console.log('Please enter the verification code sent to your Email.')
            alert("An registration email should now have been sent to the entered email, fill in the verification code and click the verification button")
            return result.user
        }
    })

    cognitoUserObj.setUser(user)
}

async function resendVerification(poolData, cognitoUserObj, username, onSuccess=null) {

    const cognito = new AWS.CognitoIdentityServiceProvider(poolData)

    let params = {}
    params['ClientId'] = poolData['ClientId']
    params['Username'] = username
    // param['Password'] = password

    const result = cognito.resendConfirmationCode(params, function(err, result) {
        if (err) {
            alert(err)
        }
        else {
            console.log(result)
            if (onSuccess) {
                onSuccess(username)
            }
        }
    })
}

async function logIn (poolData, cognitoUserObj, username, password) {
    let idToken = null
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)

    if (!username || !password) {
        console.log('login: Please enter Username and Password!')
    } else {
        const authenticationData = {
            Username: username,
            Password: password
        }
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData)

        const userData = {
            Username: username,
            Pool: userPool
        }
        const user = new AmazonCognitoIdentity.CognitoUser(userData)
        cognitoUserObj.setUser(user)

        user.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('login: Logged in!')

                idToken = result.getIdToken().getJwtToken()
                console.log('login: Printing ID token')
                cognitoUserObj.setId(idToken)
                return true
            },

            onFailure: function (err) {
                console.log(err)
                return false
            }

        })
    }
}

async function getCurrentLoggedInUser (poolData) {
    // console.log(poolData);
    const userPool = await new AmazonCognitoIdentity.CognitoUserPool(poolData)
    return userPool.getCurrentUser()
}

/*
If user has logged in before, get the previous session so user doesn't need to log in again.
*/
async function getCurrentLoggedInSession (cognitoUserObj) {

    const cognitoUser = cognitoUserObj.user
    if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
            if (err) {
                console.log(err.message)
            } else {
                console.log('login: Session found! Logged in.')
                console.log(session)
                const idToken = session.getIdToken().getJwtToken()
                cognitoUserObj.setId(idToken)
            }
        })
    } else {
        console.log('login: Session expired. Please log in again.')
    }
}

function logOut (cognitoUserObj) {
    if (cognitoUserObj.user != null) {
        cognitoUserObj.logout()
        console.log('login: Logged out!')
    } else {
        console.log('login: No user logged in')
    }
}

async function verifyCode (cognitoUserObj, verificationCode) {
    const user = cognitoUserObj.user
    user.confirmRegistration(verificationCode, true, function (err, result) {
        if (err) {
            alert(err.message)
        } else {
            console.log('login: Successfully verified user!')
        }
    })
}

export {
    registerUser, logIn, getCurrentLoggedInSession, verifyCode, logOut,
    getCurrentLoggedInUser, UserObject, resendVerification
}
