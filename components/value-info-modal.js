import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

/*
 * Events:
 * - saw.modal-close                        dispatched when the modal is closed
 * - saw.valueinfomodal-delete-value-click  dispatched when the user clicks on the delete value
 *                                          button
 * - saw.valueinfomodal-edit-value-click    dispatched when the user clicks on the edit value button
 */
class ValueInfoModal extends HTMLElement {
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
                <p id="note"></p>
                <ul id="habits"></ul>

                <button id="delete_button">delete</button>
                <button id="edit_button">edit</button>
            </paper-dialog>
        `

        this._value = {
            name: '',
            description: '',
            note: ''
        }
        this._habit = {
            name: '',
            description: '',
            note: '',
            values: []
        }
        this._dialog = this.shadowRoot.querySelector('#dialog')
    }

    get value () { return this._value }
    set value (value) { this._value = value }

    get habits () { return this._habits }
    set habits (habits) { this._habits = habits }

    close () {
        this._dialog.close()
    }

    connectedCallback () {
        const deleteButton = this.shadowRoot.querySelector('#delete_button')
        const editButton = this.shadowRoot.querySelector('#edit_button')

        this.shadowRoot.querySelector('#title').innerHTML = this._value.name

        if (this._value.description) {
            this.shadowRoot.querySelector('#description').innerHTML = this._value.description
        }

        if (this._value.note) {
            this.shadowRoot.querySelector('#note').innerHTML = this._value.note
        }

        this._habits.forEach(habit =>
            this.shadowRoot.querySelector('#habits').appendChild(this._createHabitListItem(habit))
        )

        deleteButton.addEventListener('click', e => {
            this.dispatchEvent(new CustomEvent('saw.valueinfomodal-delete-click', {
                detail: {
                    value: this._value
                }
            }))
        })

        editButton.addEventListener('click', e => {
            this.dispatchEvent(new CustomEvent('saw.valueinfomodal-edit-click', {
                detail: {
                    value: this._value
                }
            }))
        })

        this._dialog.addEventListener('iron-overlay-closed', () =>
            this.dispatchEvent(new CustomEvent('saw.modal-close')))

        this._dialog.open()
    }

    _createHabitListItem (habit) {
        const li = document.createElement('li')
        li.innerHTML = habit
        return li
    }
}

customElements.define('saw-value-info-modal', ValueInfoModal)

export { ValueInfoModal }
