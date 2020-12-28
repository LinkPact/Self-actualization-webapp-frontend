import { getS3JSON, putS3JSON } from "./modules/s3_interaction.js";

const s3BucketName = 'selfactualizationtest';
const jsonPath = 'self-actualization-global-data.json';
let data = {
    "values": [],
    "habits": []
};

// Setup identity pool
AWS.config.region = 'eu-north-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-north-1:51a3d198-8df4-48b0-bc86-61e12f4539d9',
});


const s3 = new AWS.S3();

async function loadFromDatabase(s3BucketName) {
    return await getS3JSON(s3, s3BucketName, jsonPath);
}

// https://stackoverflow.com/questions/43376270/how-to-dynamically-populate-a-list-on-an-html-page
function updateHabitsDisplay(values, habits) {
    const container = document.getElementById("value-container");
    container.innerHTML = "";

    values.forEach(function(entry) {
        const habitsForValue = habits.filter(habit => habit.values.includes(entry));
        container.appendChild(createValueCard(entry, habitsForValue));
    });
}

function createValueCard(value, habits) {
    const card = document.createElement('paper-card');
    const cardContents = document.createElement('div');
    cardContents.classList.add('card-content');
    const cardContentsList = document.createElement('ul');

    habits.forEach(habit => {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(habit.name));
        li.appendChild(createDeleteHabitButton(habit));
        cardContentsList.appendChild(li);
    });

    card.setAttribute('heading', value);
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
        const input = document.getElementById('value_input');
        const valueName = input.value;
        input.value = "";
        data.values.push(valueName);
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
}

addListeners();

window.onload = async function() {
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
};
