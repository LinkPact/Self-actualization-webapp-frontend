import { getS3JSON, putS3JSON } from "../../modules/s3_interaction.js";

const s3BucketName = 'selfactualizationtest';
const jsonPath = 'test.json';

// Setup identity pool
AWS.config.region = 'eu-north-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-north-1:51a3d198-8df4-48b0-bc86-61e12f4539d9',
});


const s3 = new AWS.S3();
let loadedEntries = ["Default entries"];

function newEntryClick(newEntry) {
    loadedEntries.push(newEntry);
    updateHabitsDisplay(loadedEntries);
}

async function sendToDatabaseClick() {
    putS3JSON(s3, s3BucketName, jsonPath, loadedEntries);
}

async function loadFromDatabase(s3BucketName) {

    loadedEntries = await getS3JSON(s3, s3BucketName, jsonPath);
    updateHabitsDisplay(loadedEntries);
}

// https://stackoverflow.com/questions/43376270/how-to-dynamically-populate-a-list-on-an-html-page
function updateHabitsDisplay(entries) {
    const listElem = document.getElementById("habits_list");
    listElem.innerHTML = "";

    entries.forEach(function(entry) {
        const newItem = document.createElement('li');
        newItem.appendChild(document.createTextNode(entry));
        listElem.appendChild(newItem);
    });
}

function resetDatabase() {
    console.log("Reset database");
    loadedEntries = ["Health", "Usefulness", "Empathy"];
    putS3JSON(s3, s3BucketName, jsonPath, loadedEntries);
    updateHabitsDisplay(loadedEntries);
}

window.onload = function() {
    loadFromDatabase(s3BucketName);
    updateHabitsDisplay(loadedEntries);
};

// Binding callbacks through JS
// https://stackoverflow.com/questions/53630310/use-functions-defined-in-es6-module-directly-in-html

function addListeners() {

    console.log("Adding listeners to buttons");

    document
        .getElementById('newEntryButton')
        .addEventListener('click',
            function() {newEntryClick(document.getElementById('goal_input').value)});

    document
        .getElementById('sendToDbButton')
        .addEventListener('click', sendToDatabaseClick);

    document
        .getElementById('loadFromDbButton')
        .addEventListener('click', function() {loadFromDatabase(s3BucketName)});

    document
        .getElementById('resetDbButton')
        .addEventListener('click', resetDatabase);

}

addListeners();

export { newEntryClick };

