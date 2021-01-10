import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

/*
 * Events:
 * - saw.valuecard-delete-habit-click   dispatched when the user clicks on the delete habit button
 * - saw.valuecard-edit-value-click     dispatched when the user clicks on the edit habit button
 */
class HabitInfoModal extends HTMLElement {
    constructor () {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                #dialog {
                    width: 40%;
                }
            </style>

            <paper-dialog id="dialog">
                <h3 id="title"></h3>
                <p id="description"></p>
                <ul id="values"></ul>

                <button id="delete_button">delete</button>
                <button id="edit_button">edit</button>
            </paper-dialog>
        `

        this._habit = {
            name: '',
            description: ''
        }
        this._connectedValues = []
    }

    get habit () { return this._habit }
    set habit (habit) { this._habit = habit }

    get connectedValues () { return this._connectedValues }
    set connectedValues (connectedValues) { this._connectedValues = connectedValues }

    connectedCallback () {
        const dialog = this.shadowRoot.querySelector('#dialog')
        const deleteButton = this.shadowRoot.querySelector('#delete_button')
        const editButton = this.shadowRoot.querySelector('#edit_button')

        if (this._habit.description) {
            this.shadowRoot.querySelector('#description').innerHTML = this._habit.description
        }

        deleteButton.addEventListener('click', e => {
            e.preventDefault()
            this.dispatchEvent(new CustomEvent('saw.habitinfomodal-delete-click', {
                detail: {
                    habit: this._habit
                }
            }))
        })

        editButton.addEventListener('click', e => {
            e.preventDefault()
            this.dispatchEvent(new CustomEvent('saw.habitinfomodal-edit-click', {
                detail: {
                    habit: this._habit
                }
            }))
        })

        dialog.open()
    }
}

customElements.define('saw-habit-info-modal', HabitInfoModal)

export { HabitInfoModal }
