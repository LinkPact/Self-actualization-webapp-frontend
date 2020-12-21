import { getS3JSON, putS3JSON } from "../../modules/s3_interaction.js";

const s3BucketName = 'selfactualizationtest';
const jsonPath = 'testDb.json';

// Setup identity pool
AWS.config.region = 'eu-north-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-north-1:51a3d198-8df4-48b0-bc86-61e12f4539d9',
});

// Access S3 bucket using the anonymous credentials
const s3 = new AWS.S3({
    params: {Bucket: s3BucketName, Key: "user1.json"}
});

let loadedEntries = ["Health", "Usefulness", "Empathy"];
// putS3JSON(s3, s3BucketName, "test.json", loadedEntries);

// let loadedEntries = getS3JSON(s3, s3BucketName, "test.json");
console.log(loadedEntries);




function newEntryClick(newEntry) {
    console.log("New entry clicked");
    loadedEntries.push(newEntry);
    updateHabitsDisplay();
}

function sendToDatabaseClick() {
    console.log("Sending to database");
    putS3JSON(s3, s3BucketName, "test.json", loadedEntries);
}

function loadFromDatabaseClick() {
    console.log("Loading from database");
    loadedEntries = getS3JSON(s3, s3BucketName, "test.json");
    console.log("Loaded: " + loadedEntries[0]);
    updateHabitsDisplay();
}

// https://stackoverflow.com/questions/43376270/how-to-dynamically-populate-a-list-on-an-html-page
function updateHabitsDisplay() {
    const listElem = document.getElementById("habits_list");
    listElem.innerHTML = "";

    loadedEntries.forEach(function(entry) {
        const newItem = document.createElement('li');
        newItem.appendChild(document.createTextNode(entry));
        listElem.appendChild(newItem);
    });
}

function resetDatabase() {
    console.log("Reset database");
    const defaultEntries = ["Health", "Usefulness", "Empathy"];
    putS3JSON(s3, s3BucketName, "test.json", defaultEntries);
}

window.onload = function() {
    updateHabitsDisplay();
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
        .addEventListener('click', loadFromDatabaseClick);

    document
        .getElementById('resetDbButton')
        .addEventListener('click', resetDatabase);

}

addListeners();

export { newEntryClick };

