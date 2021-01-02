import { getS3JSON, putS3JSON } from './modules/s3_interaction.js'
import { logIn, logOut, UserObject } from './modules/login.js'
import './components/upsert-value-modal.js'

const s3BucketName = 'selfactualizationtest'

let data = {
    values: [],
    habits: []
}

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

const s3 = new AWS.S3()

function jsonPath () {
    return cognitoUserObj.getUsername()
}

async function loadFromDatabase (s3BucketName) {
    return getS3JSON(s3, s3BucketName, jsonPath())
}

async function loadFromDatabaseAndFill () {
    try {
        data = await loadFromDatabase(s3BucketName)
    } catch (ignored) { }

    if (data.values === undefined || data.habits === undefined) {
        data = {
            values: [],
            habits: []
        }
    }

    updateHabitsDisplay(data.values, data.habits)
}

const cognitoUserObj = new UserObject(
    'show_when_logged_in',
    'show_when_logged_out',
    'login_status'
)
cognitoUserObj.registerLoginCompletedFunction(loadFromDatabaseAndFill)

// https://stackoverflow.com/questions/43376270/how-to-dynamically-populate-a-list-on-an-html-page
function updateHabitsDisplay (values, habits) {
    const container = document.getElementById('value-container')
    container.innerHTML = ''

    values.forEach(entry => {
        const habitsForValue = habits.filter(habit => habit.values.includes(entry.name))
        container.appendChild(createValueCard(entry, habitsForValue))
    })
}

function createValueCard (value, habits) {
    const card = document.createElement('paper-card')
    const cardContents = document.createElement('div')
    cardContents.classList.add('card-content')
    const cardContentsList = document.createElement('ul')
    const description = document.createElement('p')
    description.innerHTML = value.description

    habits.forEach(habit => {
        const li = document.createElement('li')
        li.appendChild(document.createTextNode(habit.name))
        li.appendChild(createDeleteHabitButton(habit))
        cardContentsList.appendChild(li)
    })

    card.setAttribute('heading', value.name)
    cardContents.appendChild(description)
    cardContents.appendChild(createDeleteValueButton(value))
    cardContents.appendChild(cardContentsList)
    card.appendChild(cardContents)

    return card
}

function onDeleteEntityClicked (value, targetData) {
    const index = data[targetData].indexOf(value);

    if (index !== -1) {
        data[targetData].splice(index, 1)

        putS3JSON(s3, s3BucketName, jsonPath(), data)
        updateHabitsDisplay(data.values, data.habits)
    }
}

function createDeleteValueButton (value) {
    const deleteValueButton = document.createElement('button')
    deleteValueButton.innerHTML = 'Remove value'
    deleteValueButton.addEventListener('click', () => {
        onDeleteEntityClicked(value, "values")
    })
    return deleteValueButton
}

function createDeleteHabitButton (habit) {
    const deleteHabitButton = document.createElement('button')
    deleteHabitButton.innerHTML = 'x'
    deleteHabitButton.addEventListener('click', () => {
        onDeleteEntityClicked(habit, "habits")
    })

    return deleteHabitButton
}

function createUpsertValueModal () {
    const modal = document.createElement('saw-upsert-value-modal')
    modal.addEventListener('saw.modal-close', () => document.body.removeChild(modal))
    modal.addEventListener('saw.modal-submit', onSubmitValue)
    document.body.appendChild(modal)
    return modal
}

function onSubmitValue (event) {
    data.values.push({
        name: event.detail.input.name,
        description: event.detail.input.description
    })
    updateHabitsDisplay(data.values, data.habits)
    putS3JSON(s3, s3BucketName, jsonPath(), data)
}

    document.getElementById('newHabitButton').addEventListener('click', () => {
        const nameInput = document.getElementById('habit_name_input')
        const valuesInput = document.getElementById('habit_values_input')
        const habitName = nameInput.value
        const habitValues = valuesInput.value.split(',').map(value => value.trim())
        nameInput.value = ''
        valuesInput.value = ''

        data.habits.push({
            name: habitName,
            values: habitValues
        })

        updateHabitsDisplay(data.values, data.habits)
        putS3JSON(s3, s3BucketName, jsonPath(), data)

        document.getElementById('add_habit_modal').close()
    })

    document.getElementById('login_button').addEventListener('click', async () => {
        await logIn(
            poolData,
            cognitoUserObj,
            document.getElementById('email').value,
            document.getElementById('password').value
        )
    })

    function fireLogin(event) {
        event.preventDefault()
        if (event.key === 'Enter') {
            document.getElementById('login_button').click()
        }
    }

    document.getElementById('email')
        .addEventListener('keyup', fireLogin)

    document.getElementById('password')
        .addEventListener('keyup', fireLogin)

    document.getElementById('logout_button').addEventListener('click', async () => {
        await logOut(cognitoUserObj)
        loadFromDatabaseAndFill()
    })

    document.getElementById('open_add_value_modal_button').addEventListener('click', () =>
        createUpsertValueModal().addEventListener('saw.modal-submit', onSubmitValue)
    )

    document.getElementById('open_add_habit_modal_button').addEventListener('click', () => {
        document.getElementById('add_habit_modal').open()
    })
}

addListeners()

window.onload = () => loadFromDatabaseAndFill()
