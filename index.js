import { getS3JSON, putS3JSON } from './modules/s3_interaction.js'
import { logIn, logOut, UserObject } from './modules/login.js'
import './components/upsert-value-modal.js'
import './components/upsert-habit-modal.js'
import './components/value-card.js'

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
        const habitsForValue = data.habits.filter(habit => habit.values.includes(entry.name))
        container.appendChild(createValueCard(entry, habitsForValue))
    })
}

function createValueCard (value, habits) {
    const card = document.createElement('saw-value-card')

    card.value = value
    card.habits = habits
    card.addEventListener('saw.valuecard-delete-value-click', e => {
        onDeleteEntityClicked(value, 'values')
    })
    card.addEventListener('saw.valuecard-delete-habit-click', e => {
        onDeleteEntityClicked(e.detail.habit, 'habits')
    })
    card.addEventListener('saw.valuecard-edit-value-click', () => {
        onEditValueClicked(value)
    })

    return card
}

function openModal (modal) {
    modal.addEventListener('saw.modal-close', () => document.body.removeChild(modal))
    document.body.appendChild(modal)
}

function openAddValueModal () {
    const modal = document.createElement('saw-upsert-habit-modal')
    modal.addEventListener('saw.modal-submit', onAddValue)
    openModal(modal)
}

function openEditValueModal (valueToEdit) {
    const modal = document.createElement('saw-upsert-value-modal')
    modal.setAttribute('prefill-name', valueToEdit.name)
    modal.setAttribute('prefill-description', valueToEdit.description)
    modal.addEventListener('saw.modal-submit', e => onEditValue(valueToEdit))
    openModal(modal)
}

function openAddHabitModal () {
    const modal = document.createElement('saw-upsert-habit-modal')
    modal.addEventListener('saw.modal-submit', onAddHabit)
    openModal(modal)
}

function onAddValue (event) {
    data.values.push({
        name: event.detail.input.name,
        description: event.detail.input.description
    })
    updateHabitsDisplay(data.values, data.habits)
    putS3JSON(s3, s3BucketName, jsonPath(), data)
}

function onEditValue (valueToUpdate, affectedHabits, submitEvent) {
    valueToUpdate.name = submitEvent.detail.input.name
    valueToUpdate.description = submitEvent.detail.input.description

    affectedHabits.forEach(habit => {
        const index = habit.values.indexOf(valueToUpdate.name)

        if (index !== -1) {
            habit.values[index] = submitEvent.detail.input.name
        }
    })

    updateHabitsDisplay(data.values, data.habits)
    putS3JSON(s3, s3BucketName, jsonPath, data)
}

function onAddHabit (event) {
    data.habits.push({
        name: event.detail.input.name,
        values: event.detail.input.values
    })
    updateHabitsDisplay(data.values, data.habits)
    putS3JSON(s3, s3BucketName, jsonPath(), data)
}

function onEditValueClicked (value) {
    openEditValueModal(value)
}

function onDeleteEntityClicked (value, targetData) {
    const index = data[targetData].indexOf(value)

    if (index !== -1) {
        data[targetData].splice(index, 1)

        putS3JSON(s3, s3BucketName, jsonPath(), data)
        updateHabitsDisplay(data.values, data.habits)
    }
}

function addListeners () {
    document.getElementById('login_button').addEventListener('click', async () => {
        await logIn(
            poolData,
            cognitoUserObj,
            document.getElementById('email').value,
            document.getElementById('password').value
        )
    })

    function fireLogin (event) {
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
        openAddValueModal()
    )

    document.getElementById('open_add_habit_modal_button').addEventListener('click', () => {
        openAddHabitModal()
    })
}

addListeners()

window.onload = () => loadFromDatabaseAndFill()
