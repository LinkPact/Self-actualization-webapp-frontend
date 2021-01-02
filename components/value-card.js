import 'https://unpkg.com/@polymer/paper-card/paper-card.js?module'

/**
 * A card displaying information about a value.
 *
 * Create by calling createElement('saw-value-card'), set up 'value' and 'habits' using the
 * setters and finally add event listeners to handle the events listed below.
 *
 * When habits are deleted. All cards must currently be updated by updating their 'habits' property
 * and calling update. Will think of a better way to solve this later.
 *
 * Currently not possible to add value information using attributes.
 *
 * Events:
 * - saw.valuecard-delete-value-click   dispatched when the user clicks on the delete value button
 * - saw.valuecard-delete-habit-click   dispatched when the user clicks on the delete habit button
 * - saw.valuecard-edit-value-click     dispatched when the user clicks on the edit habit button
 */
class ValueCard extends HTMLElement {
    constructor () {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                paper-card {
                    display: block;
                }
            </style>

            <paper-card id='card' heading='test'>
                <div class='card-content'>
                    <p id='description'></p>

                    <button id='delete-value-button'>Delete value</button>
                    <button id='edit-value-button'>Edit value</button>

                    <ul id='habit-list'></ul>
                </div>
            </paper-card>
        `
        this._value = {
            name: '',
            description: '',
            values: []
        }
        this._habits = []
    }

    get value () { return this._value }
    set value (value) { this._value = value }

    get habits () { return this._habits }
    set habits (habits) { this._habits = habits }

    connectedCallback () {
        this.shadowRoot.querySelector('#card').heading = this._value.name
        this.shadowRoot.querySelector('#description').innerHTML = this._value.description

        this.shadowRoot.querySelector('#delete-value-button').addEventListener('click', e =>
            this.dispatchEvent(new CustomEvent('saw.valuecard-delete-value-click', {
                detail: {
                    value: this._value
                }
            }))
        )

        this.shadowRoot.querySelector('#edit-value-button').addEventListener('click', e => {
            e.preventDefault()

            this.dispatchEvent(new CustomEvent('saw.valuecard-edit-value-click', {
                detail: {
                    value: this._value,
                    habits: this._habits
                }
            }
            ))
        })

        this.update()
    }

    update () {
        const habitList = this.shadowRoot.querySelector('#habit-list')
        habitList.innerHTML = ''
        this._habits.forEach(habit => habitList.appendChild(this._createHabitListItem(habit)))
    }

    _createHabitListItem (habit) {
        const li = document.createElement('li')
        const btn = document.createElement('button')

        btn.innerHTML = 'x'
        li.innerHTML = habit.name

        btn.addEventListener('click', e => {
            e.preventDefault()
            this.dispatchEvent(new CustomEvent('saw.valuecard-delete-habit-click', {
                detail: {
                    habit: habit
                }
            }))
        })

        li.appendChild(btn)

        return li
    }
}

customElements.define('saw-value-card', ValueCard)

export { ValueCard }
