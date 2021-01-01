import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

/**
 * Attributes:
 *
 *      prefill-name        -- value to prefill name input field with
 *      prefill-description -- value to prefill description input field with
 *
 * Events:
 *      saw.modal-submit -- called when the user presses the submit button and passes user input
 *                            in event.detail.input
 *      saw.modal-close  -- called when the dialog is closed
 */
class UpsertValueModal extends HTMLElement {
    constructor () {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
            <style>
                label {
                    display: block;
                }

                textarea {
                    display: block;
                }
            </style>

            <paper-dialog id="dialog">
                <form>
                    <h3 id="title">Add Value</h3>

                    <label for="name-input">
                        Name: <input type="text" id="name-input" />
                    </label>

                    <label for="description-input">
                        Description:
                        <textarea id="description-input"></textarea>
                    </label>

                    <button>Add value</button>
                </form>
            </paper-dialog>
        `
    }

    connectedCallback () {
        const dialog = this.shadowRoot.querySelector('#dialog')

        this.shadowRoot.querySelector('form').addEventListener('submit', (event) => {
            /*
             * By default, a submitted form has action="self" which means that the page will be
             * refreshed. We do not want that so we call preventDefault which prevents the default
             * event handler for 'submit' events on this form to be triggered.
             */
            event.preventDefault()

            this.dispatchEvent(new CustomEvent('saw.modal-submit', {
                detail: {
                    input: {
                        name: this.shadowRoot.querySelector('#name-input').value,
                        description: this.shadowRoot.querySelector('#description-input').value
                    }
                }
            }))

            dialog.close()
        })

        dialog.addEventListener('iron-overlay-closed', () =>
            this.dispatchEvent(new CustomEvent('saw.modal-close')))

        if (this._hasAPrefillAttribute()) {
            this._addPrefills()
        }

        dialog.open()
    }

    _hasAPrefillAttribute () {
        return this.hasAttribute('prefill-name') || this.hasAttribute('prefill-description')
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
    }
}

customElements.define('saw-upsert-value-modal', UpsertValueModal)

export { UpsertValueModal }
