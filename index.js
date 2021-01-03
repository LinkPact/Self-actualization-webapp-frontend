import { getS3JSON, putS3JSON } from './modules/s3_interaction.js'
import { logIn, logOut, UserObject } from './modules/login.js'
import './components/upsert-value-modal.js'
import './components/upsert-habit-modal.js'
import './components/value-card.js'
import { downloadObjectAsJson }  from './modules/file_utils.js'

const s3BucketName = 'selfactualizationtest'

/*
 * TODO: Add store module that allows registering callbacks when its data changes, so we do not have
 *       to call putS3JSON and updateHabitDisplay every time we modify the data.
 */
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
    if (cognitoUserObj.user) {
        return cognitoUserObj.getUsername()
    } else {
        return 'default.json'
    }
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
        onDeleteValueClicked(value)
    })
    card.addEventListener('saw.valuecard-delete-habit-click', e => {
        onDeleteHabitClicked(value, e.detail.habit)
    })
    card.addEventListener('saw.valuecard-edit-value-click', e => {
        onEditValueClicked(value, e)
    })
    card.addEventListener('saw.valuecard-edit-habit-click', e => {
        onEditHabitClicked(e.detail.habit)
    })
    card.addEventListener('valuecard-move-up-click', e => {
        console.log('move up value clicked')
        onMoveValueClicked(value, 'up')
    })
    card.addEventListener('valuecard-move-down-click', e => {
        console.log('move down value clicked')
        onMoveValueClicked(value, 'down')
    })

    return card
}

function openModal (modal) {
    modal.addEventListener('saw.modal-close', () => document.body.removeChild(modal))
    document.body.appendChild(modal)
}

function openAddValueModal () {
    const modal = document.createElement('saw-upsert-value-modal')
    modal.addEventListener('saw.modal-submit', onAddValue)
    openModal(modal)
}

function openEditValueModal (valueToEdit) {
    const modal = document.createElement('saw-upsert-value-modal')
    modal.conflictingValueNames =
        data.values.filter(val => val !== valueToEdit).map(val => val.name)
    modal.setAttribute('prefill-name', valueToEdit.name)
    modal.setAttribute('prefill-description', valueToEdit.description)
    modal.addEventListener('saw.modal-submit', e =>
        onEditValue(valueToEdit, e.detail.input.name, e.detail.input.description))
    openModal(modal)
}

function openEditHabitModal (habitToEdit) {
    const modal = document.createElement('saw-upsert-habit-modal')
    modal.conflictingHabitNames =
        data.habits.filter(habit => habit !== habitToEdit).map(habit => habit.name)
    modal.setAttribute('prefill-name', habitToEdit.name)

    if (habitToEdit.description) {
        modal.setAttribute('prefill-description', habitToEdit.description)
    }

    modal.values = data.values
    modal.preselectValues = habitToEdit.values
    modal.addEventListener('saw.modal-submit', e => onEditHabit(
        habitToEdit, e.detail.input.name, e.detail.input.description, e.detail.input.values
    ))
    openModal(modal)
}

function openAddHabitModal () {
    const modal = document.createElement('saw-upsert-habit-modal')
    modal.values = data.values
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

function onEditValue (valueToUpdate, newName, newDescription) {
    const affectedHabits = data.habits.filter(habit =>
        habit.values.includes(valueToUpdate.name) && valueToUpdate.name !== newName
    )

    const oldName = valueToUpdate.name

    valueToUpdate.name = newName
    valueToUpdate.description = newDescription

    affectedHabits.forEach(habit => {
        const index = habit.values.indexOf(oldName)

        if (index !== -1) {
            habit.values[index] = newName
        }
    })

    updateHabitsDisplay(data.values, data.habits)
    putS3JSON(s3, s3BucketName, jsonPath(), data)
}

function onEditHabit (habitToEdit, newName, newDescription, newValues) {
    habitToEdit.name = newName
    habitToEdit.description = newDescription
    habitToEdit.values = newValues

    updateHabitsDisplay(data.values, data.habits)
    putS3JSON(s3, s3BucketName, jsonPath(), data)
}

function onAddHabit (event) {
    data.habits.push({
        name: event.detail.input.name,
        description: event.detail.input.description,
        values: event.detail.input.values
    })
    updateHabitsDisplay(data.values, data.habits)
    putS3JSON(s3, s3BucketName, jsonPath(), data)
}

function onEditValueClicked (value) {
    openEditValueModal(value)
}

function onEditHabitClicked (habit) {
    openEditHabitModal(habit)
}

function onMoveValueClicked(value, direction) {

    const valueName = value.name
    const valueIndex = data.values.map(value => value.name).indexOf(value.name)
    let targetIndex = -1;
    if (direction === 'up') {
        if (valueIndex > 0) {
            targetIndex = valueIndex - 1
        }
    }
    else if (direction === 'down') {
        if (valueIndex < data.values.length - 1) {
            targetIndex = valueIndex + 1
        }
    }
    else {
        throw new Error(`Unknown direction encountered: ${direction}, expected "up" or "down"`)
    }

    if (targetIndex !== -1) {
        // Swap places
        [data.values[valueIndex], data.values[targetIndex]] = [data.values[targetIndex], data.values[valueIndex]]
        putS3JSON(s3, s3BucketName, jsonPath(), data)
        updateHabitsDisplay(data.values, data.habits)
    }

}

function onDeleteValueClicked (value) {
    removeIfPresent(data.values, value)

    putS3JSON(s3, s3BucketName, jsonPath(), data)
    updateHabitsDisplay(data.values, data.habits)
}

function onDeleteHabitClicked (value, habit) {
    // Unlink the habit from the value
    removeIfPresent(habit.values, value.name)

    // Remove the habit if it has no more values linking to it
    if (habit.values.length === 0) {
        removeIfPresent(data.habits, habit)
    }

    putS3JSON(s3, s3BucketName, jsonPath(), data)
    updateHabitsDisplay(data.values, data.habits)
}

function removeIfPresent (arr, element) {
    const index = arr.indexOf(element)

    if (index !== -1) {
        arr.splice(index, 1)
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

    document.getElementById('download_json').addEventListener('click', () => {
        downloadObjectAsJson(data, 'backup')
    })
}

addListeners()

window.onload = () => loadFromDatabaseAndFill()
