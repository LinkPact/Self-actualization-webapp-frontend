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
                <form>
                    <h3>Add Value</h3>

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
        const dialog = this.shadowRoot.getElementById('dialog')

        this.shadowRoot.getElementByTagName('form').addEventListener('onsubmit', (event) => {
            /*
             * By default, a submitted form has action="self" which means that the page will be
             * refreshed. We do not want that so we call preventDefault which prevents the default
             * event handler for 'onsubmit' events on this form to be triggered.
             */
            event.preventDefault()

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
