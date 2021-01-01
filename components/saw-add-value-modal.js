import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

/**
 * Events:
 *      on-submit -- called when the user presses the submit button and passes user input in
 *                   event.detail.input
 *      on-close  -- called when the dialog is closed
 */
class SawAddValueModal extends HTMLElement {
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
                <div>
                    <h3>Add Value</h3>

                    <label for="name-input">
                        Name: <input type="text" id="name-input" />
                    </label>

                    <label for="description-input">
                        Description:
                        <textarea id="description-input"></textarea>
                    </label>

                    <button id="submit-button">Add value</button>
                </div>
            </paper-dialog>
        `
    }

    connectedCallback () {
        const dialog = this.shadowRoot.getElementById('dialog')

        this.shadowRoot.getElementById('submit-button').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('on-submit', {
                detail: {
                    input: {
                        name: this.shadowRoot.getElementById('name-input').value,
                        description: this.shadowRoot.getElementById('description-input').value
                    }
                }
            }))

            dialog.close()
        })

        dialog.addEventListener('iron-overlay-closed', () =>
            this.dispatchEvent(new CustomEvent('on-close')))

        dialog.open()
    }
}

customElements.define('saw-add-value-modal', SawAddValueModal)

export { SawAddValueModal }
