import { getS3JSON, putS3JSON } from "../../modules/s3_interaction.js";

const s3BucketName = 'selfactualizationtest';
const jsonPath = 'test.json';
const habits = [
    {
        "name": "Eat vegetables",
        "frequency": "daily",
        "values": [
            "Health"
        ]
    },
    {
        "name": "Take a walk",
        "frequency": "daily",
        "values": [
            "Health"
        ]
    },
    {
        "name": "Donate $5 to charity",
        "frequency": "monthly",
        "values": [
            "Usefulness",
            "Empathy"
        ]
    }
];

// Setup identity pool
AWS.config.region = 'eu-north-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-north-1:51a3d198-8df4-48b0-bc86-61e12f4539d9',
});


const s3 = new AWS.S3();
let loadedEntries = ["Default entries"];

async function loadFromDatabase(s3BucketName) {
    loadedEntries = await getS3JSON(s3, s3BucketName, jsonPath);
    updateHabitsDisplay(loadedEntries, habits);
}

// https://stackoverflow.com/questions/43376270/how-to-dynamically-populate-a-list-on-an-html-page
function updateHabitsDisplay(entries, habits) {
    const container = document.getElementById("value-container");
    container.innerHTML = "";

    entries.forEach(function(entry) {
        const habitsForValue = habits.filter(habit => habit.values.includes(entry));
        container.appendChild(createValueCard(entry, habitsForValue));
    });
}

function createValueCard(heading, habits) {
    const card = document.createElement('paper-card');
    const cardContents = document.createElement('div');
    cardContents.classList.add('card-content');
    const cardContentsList = document.createElement('ul');

    habits.forEach(habit => {
        const li = document.createElement('li');
        li.innerHTML = habit.name;
        cardContentsList.appendChild(li);
    });

    card.setAttribute('heading', heading);
    cardContents.appendChild(cardContentsList);
    card.appendChild(cardContents);

    return card;
}

function addListeners() {
    document.getElementById('newValueButton').addEventListener('click', () => {
        const input = document.getElementById('value_input');
        const valueName = input.value;
        input.value = "";
        loadedEntries.push(valueName);
        updateHabitsDisplay(loadedEntries, habits);
    });

    document.getElementById('newHabitButton').addEventListener('click', () => {
        const nameInput = document.getElementById('habit_name_input');
        const valuesInput = document.getElementById('habit_values_input');
        const habitName = nameInput.value;
        const habitValues = valuesInput.value.split(',').map(value => value.trim());
        nameInput.value = "";
        valuesInput.value = "";

        habits.push({
            "name": habitName,
            "values": habitValues
        });

        updateHabitsDisplay(loadedEntries, habits);
    });
}

addListeners();

window.onload = function() {
    loadFromDatabase(s3BucketName);
    updateHabitsDisplay(loadedEntries, habits);
};
