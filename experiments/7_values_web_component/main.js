import '../../components/value-card.js'

const data = {
    values: [
        {
            name: 'Health',
            description: 'Feel good and avoid sickness.'
        },
        {
            name: 'Productivity',
            description: 'Be effective and get things done.'
        },
        {
            name: 'Belongingness',
            description: 'Feel needed and respected.'
        }
    ],
    habits: [
        {
            name: 'Take a walk every day',
            values: [
                'Health',
                'Productivity'
            ]
        },
        {
            name: 'Eat vegatables',
            values: [
                'Health'
            ]
        },
        {
            name: 'Work on a side project every weekday',
            values: [
                'Productivity'
            ]
        },
        {
            name: 'Talk to someone every day',
            values: [
                'Belongingness'
            ]
        }
    ]
}

function updateCards () {
    document.querySelectorAll('saw-value-card').forEach(card => {
        card.habits = data.habits.filter(habit => habit.values.includes(card.value.name))
        console.log(card.habits)
        card.update()
    })
}

window.onload = () => {
    const container = document.querySelector('#value-container')

    data.values.forEach(value => {
        const card = document.createElement('saw-value-card')
        card.value = value
        card.habits = data.habits.filter(habit => habit.values.includes(value.name))

        card.addEventListener('saw.valuecard-delete-value-click', e => {
            const index = data.values.indexOf(value)

            if (index !== -1) {
                data.values.splice(index, 1)
                container.removeChild(card)
            }
        })

        card.addEventListener('saw.valuecard-delete-habit-click', e => {
            const index = data.habits.indexOf(e.detail.habit)

            if (index !== -1) {
                data.habits.splice(index, 1)
                updateCards()
            }
        })

        container.appendChild(card)
    })
}
