import { getS3JSON, putS3JSON } from "./modules/s3_interaction.js";
import { logIn, logOut } from "./modules/login.js";

const s3BucketName = 'selfactualizationtest';
let jsonPath = 'self-actualization-global-data.json';
let data = {
    "values": [],
    "habits": []
};

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
    loginCompleted() {
        console.log(`Assigning json path: ${this.user.username}`);
        jsonPath = this.user.username;
        loadFromDatabaseAndFill();
        this.show_login_elements(true);
    },
    logout() {
        this.user.signOut();
        this.id = null;
        this.user = null;
        this.show_login_elements(false);
    },
    show_login_elements(logged_in) {
        const logged_out_elems = document.getElementsByClassName('show_when_logged_out');
        const logged_in_elems = document.getElementsByClassName('show_when_logged_in');

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
    },
    show_logout_elements() {

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

const s3 = new AWS.S3();

async function loadFromDatabase(s3BucketName) {
    return getS3JSON(s3, s3BucketName, jsonPath);
}

async function loadFromDatabaseAndFill() {
    try {
        data = await loadFromDatabase(s3BucketName);
    } catch (ignored) { }

    if (data.values === undefined || data.habits === undefined) {
        data = {
            "values": [],
            "habits": []
        }
    }

    updateHabitsDisplay(data.values, data.habits);
}



// https://stackoverflow.com/questions/43376270/how-to-dynamically-populate-a-list-on-an-html-page
function updateHabitsDisplay(values, habits) {
    const container = document.getElementById("value-container");
    container.innerHTML = "";

    values.forEach(entry => {
        const habitsForValue = habits.filter(habit => habit.values.includes(entry.name));
        container.appendChild(createValueCard(entry, habitsForValue));
    });
}

function createValueCard(value, habits) {
    const card = document.createElement('paper-card');
    const cardContents = document.createElement('div');
    cardContents.classList.add('card-content');
    const cardContentsList = document.createElement('ul');
    const description = document.createElement('p');
    description.innerHTML = value.description;

    habits.forEach(habit => {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(habit.name));
        li.appendChild(createDeleteHabitButton(habit));
        cardContentsList.appendChild(li);
    });

    card.setAttribute('heading', value.name);
    cardContents.appendChild(description);
    cardContents.appendChild(createDeleteValueButton(value));
    cardContents.appendChild(cardContentsList);
    card.appendChild(cardContents);

    return card;
}

function onDeleteHabitClicked(habit) {
    let index = data.habits.indexOf(habit);

    if (index !== -1) {
        data.habits.splice(index, 1);

        putS3JSON(s3, s3BucketName, jsonPath, data);
        updateHabitsDisplay(data.values, data.habits);
    }
}

function onDeleteValueClicked(value) {
    let index = data.values.indexOf(value);

    if (index !== -1) {
        data.values.splice(index, 1);

        putS3JSON(s3, s3BucketName, jsonPath, data);
        updateHabitsDisplay(data.values, data.habits);
    }
}

function createDeleteValueButton(value) {
    const deleteValueButton = document.createElement('button');
    deleteValueButton.innerHTML = 'Remove value';
    deleteValueButton.addEventListener('click', () => {
        onDeleteValueClicked(value);
    });

    return deleteValueButton;
}

function createDeleteHabitButton(habit) {
    const deleteHabitButton = document.createElement('button');
    deleteHabitButton.innerHTML = 'x';
    deleteHabitButton.addEventListener('click', () => {
        onDeleteHabitClicked(habit);
    });

    return deleteHabitButton;
}

function addListeners() {
    document.getElementById('newValueButton').addEventListener('click', () => {
        const nameInput = document.getElementById('value_name_input');
        const descInput = document.getElementById('value_description_input');
        const valueName = nameInput.value;
        const description = descInput.value;
        nameInput.value = "";
        descInput.value = "";
        data.values.push({
            "name": valueName,
            "description": description
        });
        updateHabitsDisplay(data.values, data.habits);
        putS3JSON(s3, s3BucketName, jsonPath, data);
    });

    document.getElementById('newHabitButton').addEventListener('click', () => {
        const nameInput = document.getElementById('habit_name_input');
        const valuesInput = document.getElementById('habit_values_input');
        const habitName = nameInput.value;
        const habitValues = valuesInput.value.split(',').map(value => value.trim());
        nameInput.value = "";
        valuesInput.value = "";

        data.habits.push({
            "name": habitName,
            "values": habitValues
        });

        updateHabitsDisplay(data.values, data.habits);
        putS3JSON(s3, s3BucketName, jsonPath, data);
    });

    document.getElementById('login_button').addEventListener('click', async () => {
        await logIn(
            poolData,
            cognitoUserObj,
            document.getElementById('email').value,
            document.getElementById('password').value
        )

        // jsonPath = cognitoUserObj.user.username;
        // loadFromDatabase(s3BucketName);
    });

    document.getElementById('logout_button').addEventListener('click', async () => {
        await logOut(cognitoUserObj);
        jsonPath = "self-actualization-global-data.json";
        loadFromDatabaseAndFill();
    });
}

addListeners();

window.onload = () => loadFromDatabaseAndFill();

// window.onload = async function() {
//     try {
//         data = await loadFromDatabase(s3BucketName);
//     } catch (ignored) { }
//
//     if (data.values === undefined || data.habits === undefined) {
//         data = {
//             "values": [],
//             "habits": []
//         }
//     }
//
//     updateHabitsDisplay(data.values, data.habits);
// };
