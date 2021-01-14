import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

/**
 * A modal window for adding or editing a habit.
 *
 * Works the same as UpsertValueModal.
 *
 * Properties:
 * - values                 list of all values to populate select input with
 * - preselectValues        values to preselect in select input
 * - conflictingHabitNames  list of names of other habits to check uniqueness of input against
 *
 * Attributes:
 * - prefill-name           text to prefill name input field with
 * - prefill-description    text to prefill description input with
 * - prefill-note           text to prefill note input with
 *
 * Events: same as UpserValueModal
 */
class UpsertHabitModal extends HTMLElement {
    constructor () {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                #dialog {
                    width: 40%;
                }

                form {
                    margin-left: auto;
                    margin-right: auto;
                    width: 80%;
                }

                label {
                    display: block;
                }

                textarea {
                    display: block;
                    width: 90%;
                    height: 10em;
                }

                select {
                    display: block;
                }
            </style>

            <paper-dialog id="dialog">
                <form>
                    <h3 id="title">Add Habit</h3>

                    <label for="name-input">
                        Name: <input type="text" id="name-input" required />
                    </label>

                    <label for="description-input">
                        Description:
                        <textarea id="description-input"></textarea>
                    </label>

                    <label for="note-input">
                        Note:
                        <textarea id="note-input"></textarea>
                    </label>

                    <label for="values-input">
                        Values:
                        <select id="values-input" multiple required>
                            <option value="">--Select one or more values--</option>
                        </select>
                    </label>

                    <button>Submit</button>
                </form>
            </paper-dialog>
        `
        this._values = []
        this._preselectValues = []
        this._conflictingHabitNames = []
    }

    get values () { return this._values }
    set values (values) { this._values = values }

    get preselectValues () { return this._preselectValues }
    set preselectValues (preselectValues) { this._preselectValues = preselectValues }

    get conflictingHabitNames () { return this._conflictingHabitNames }
    set conflictingHabitNames (conflicts) { this._conflictingHabitNames = conflicts }

    connectedCallback () {
        const dialog = this.shadowRoot.querySelector('#dialog')

        this._setupCustomValidationMessage()

        this.shadowRoot.querySelector('form').addEventListener('submit', (event) => {
            /*
             * By default, a submitted form has action="self" which means that the page will be
             * refreshed. We do not want that so we call preventDefault which prevents the default
             * event handler for 'submit' events on this form to be triggered.
             */
            event.preventDefault()

            if (this._validateInput()) {
                this.dispatchEvent(new CustomEvent('saw.modal-submit', {
                    detail: {
                        input: {
                            name: this._getNameInputValue(),
                            description: this._getDescriptionInputValue(),
                            note: this._getNoteInputValue(),
                            values: this._getSelectedValues()
                        }
                    }
                }))

                dialog.close()
            } else {
                this.shadowRoot.querySelector('#name-input').reportValidity()
            }
        })

        dialog.addEventListener('iron-overlay-closed', () =>
            this.dispatchEvent(new CustomEvent('saw.modal-close')))

        if (this._hasAnyPrefillAttribute()) {
            this.shadowRoot.querySelector('#title').innerHTML = 'Edit Habit'
            this._prefillFields()
        }

        this._populateDropdown()

        dialog.open()
    }

    _setupCustomValidationMessage () {
        const nameInput = this.shadowRoot.querySelector('#name-input')

        /*
         * Use onchange since a custom validation message must be sent before the submit event
         * occurs.
         */
        nameInput.addEventListener('change', e => {
            if (this._validateInput()) {
                nameInput.setCustomValidity('')
            } else {
                nameInput.setCustomValidity('Name must be unique.')
            }
        })
    }

    _hasAnyPrefillAttribute () {
        return (
            this.hasAttribute('prefill-name') || this.hasAttribute('prefill-description') ||
            this.hasAttribute('prefill-note')
        )
    }

    _prefillFields () {
        if (this.hasAttribute('prefill-name')) {
            this.shadowRoot.querySelector('#name-input').value = this.getAttribute('prefill-name')
        }

        if (this.hasAttribute('prefill-description')) {
            this.shadowRoot.querySelector('#description-input').value =
                this.getAttribute('prefill-description')
        }

        if (this.hasAttribute('prefill-note')) {
            this.shadowRoot.querySelector('#note-input').value = this.getAttribute('prefill-note')
        }
    }

    _populateDropdown () {
        const select = this.shadowRoot.querySelector('#values-input')

        this._values.forEach(value => {
            const option = document.createElement('option')

            option.setAttribute('value', value.name)
            option.innerHTML = value.name

            if (this._preselectValues.includes(value.name)) {
                option.selected = true
            }

            select.appendChild(option)
        })
    }

    _getNameInputValue () {
        return this.shadowRoot.querySelector('#name-input').value.trim()
    }

    _getDescriptionInputValue () {
        return this.shadowRoot.querySelector('#description-input').value.trim()
    }

    _getNoteInputValue () {
        return this.shadowRoot.querySelector('#note-input').value.trim()
    }

    _getSelectedValues () {
        return Array.from(this.shadowRoot.querySelector('#values-input').querySelectorAll('option'))
            .filter(option => option.selected).map(option => option.value)
    }

    _validateInput () {
        return !this._conflictingHabitNames.includes(this._getNameInputValue())
    }
}

customElements.define('saw-upsert-habit-modal', UpsertHabitModal)

export { UpsertHabitModal }
