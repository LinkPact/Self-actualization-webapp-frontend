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

async function loadFromDatabase(s3BucketName) {
    loadedEntries = await getS3JSON(s3, s3BucketName, jsonPath);
    updateHabitsDisplay(loadedEntries);
}

// https://stackoverflow.com/questions/43376270/how-to-dynamically-populate-a-list-on-an-html-page
function updateHabitsDisplay(entries) {
    const container = document.getElementById("value-container");
    container.innerHTML = "";

    entries.forEach(function(entry) {
        container.appendChild(createValueCard(entry));
    });
}

function createValueCard(heading) {
    const card = document.createElement('paper-card');

    card.setAttribute('heading', heading);

    return card;
}

window.onload = function() {
    loadFromDatabase(s3BucketName);
    updateHabitsDisplay(loadedEntries);
};
