import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

/**
 * A modal window for adding or editing a value.
 *
 * - Use the event 'saw.modal-submit' to retrieve the values entered by the user using
 *   `event.detail.input`, which is an object containg the properties 'name' and 'description'.
 * - Should be created using createElement('saw-upsert-value-modal').
 * - Is opened as soon as it is connected to the DOM and should for most use-cases be removed
 *   from the DOM when closed using the event 'saw.modal-close'.
 *
 * Properties:
 * - conflictingValueNames  list of names of other values to check uniqueness of input against
 *
 * Attributes:
 * - prefill-name           text to prefill name input field with
 * - prefill-description    text to prefill description input field with
 * - prefill-note           text to prefill note input field with
 *
 * Events:
 * - saw.modal-submit   dispatched when the user presses the submit button and passes user input
 *                      in event.detail.input
 * - saw.modal-close    dispatched when the modal is closed
 */
class UpsertValueModal extends HTMLElement {
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
            </style>

            <paper-dialog id="dialog">
                <form>
                    <h3 id="title">Add Value</h3>

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

                    <button>Submit</button>
                </form>
            </paper-dialog>
        `
        this._conflictingValueNames = []
    }

    get conflictingValueNames () { return this._conflictingValueNames }
    set conflictingValueNames (conflicts) { this._conflictingValueNames = conflicts }

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
                            note: this._getNoteInputValue()
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

        if (this._hasAPrefillAttribute()) {
            this._addPrefills()
        }

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

    _hasAPrefillAttribute () {
        return this.hasAttribute('prefill-name') ||
            this.hasAttribute('prefill-description') ||
            this.hasAttribute('prefill-note')
    }

    _addPrefills () {
        this.shadowRoot.querySelector('#title').innerHTML = 'Edit Value'

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

    _getNameInputValue () {
        return this.shadowRoot.querySelector('#name-input').value.trim()
    }

    _getDescriptionInputValue () {
        return this.shadowRoot.querySelector('#description-input').value.trim()
    }

    _getNoteInputValue () {
        return this.shadowRoot.querySelector('#note-input').value.trim()
    }

    _validateInput () {
        return !this._conflictingValueNames.includes(this._getNameInputValue())
    }
}

customElements.define('saw-upsert-value-modal', UpsertValueModal)

export { UpsertValueModal }
