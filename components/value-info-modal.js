import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

/*
 * TODO: Need to redesign this so it is automatically updated when the 'opened'
 * attribute on the iron-collapse element is toggled.
 */

/*
 * Events:
 * - saw.modal-close                    dispatched when the modal is closed
 * - saw.valueinfomodal-delete-click    dispatched when the user clicks on the delete value
 *                                      button
 * - saw.valueinfomodal-edit-click      dispatched when the user clicks on the edit value button
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
                <ul id="habits"></ul>

                <button id="notes-toggle">Display Notes</h4>
                <iron-collapse id="collapse-area">
                    <ul id="notes"></ul>
                </iron-collapse>

                <button id="delete_button">delete</button>
                <button id="edit_button">edit</button>
            </paper-dialog>
        `

        this._value = {
            name: '',
            description: '',
            note: ''
        }
        this._habits = {
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
        this.shadowRoot.querySelector('#title').innerHTML = this._value.name

        if (this._value.description) {
            this.shadowRoot.querySelector('#description').innerHTML = this._value.description
        }

        this._value.notes?.forEach(note => (
            this.shadowRoot.querySelector('#notes').appendChild(this._createNoteListItem(note))
        ))

        this._habits.forEach(habit =>
            this.shadowRoot.querySelector('#habits').appendChild(this._createHabitListItem(habit))
        )

        this._dialog.open()
    }

    _createHabitListItem (habit) {
        const li = document.createElement('li')
        li.innerHTML = habit.name
        return li
    }

    _createNoteListItem (note) {
        const li = document.createElement('li')
        li.innerHTML = note
        return li
    }

    _setupEventListeners () {
        const deleteButton = this.shadowRoot.querySelector('#delete_button')
        const editButton = this.shadowRoot.querySelector('#edit_button')
        const expandNotesButton = this.shadowRoot.querySelector('#')

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
                    value: this._value,
                    habits: this._habits
                }
            }))
        })

        expandNotesButton.addEventListener('click', e => (
            this.querySelector('#collapse-area').toggleAttribute('opened')
        ))

        this._dialog.addEventListener('iron-overlay-closed', () =>
            this.dispatchEvent(new CustomEvent('saw.modal-close')))
    }
}

customElements.define('saw-value-info-modal', ValueInfoModal)

export { ValueInfoModal }
