import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

/**
 * A modal window for adding or editing a habit.
 *
 * Works the same as UpsertValueModal.
 *
 * Attributes:
 * - prefill-name           text to prefill name input field with
 * - prefill-values         text to prefill values input field with
 *
 * Events: same as UpserValueModal
 */
class UpsertHabitModal extends HTMLElement {
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
                    <h3 id="title">Add Habit</h3>

                    <label for="name-input">
                        Name: <input type="text" id="name-input" />
                    </label>

                    <label for="habit-values-input">
                        Values: <input type="text" id="values-input" />
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
                        values: this.shadowRoot.querySelector('#values-input').value
                            .split(',').map(str => str.trim())
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
        return this.hasAttribute('prefill-name') || this.hasAttribute('prefill-values')
    }

    _addPrefills () {
        this.shadowRoot.querySelector('#title').innerHTML = 'Edit Habit'

        if (this.hasAttribute('prefill-name')) {
            this.shadowRoot.querySelector('#name-input').value = this.getAttribute('prefill-name')
        }

        if (this.hasAttribute('prefill-values')) {
            this.shadowRoot.querySelector('#values-input').value =
                this.getAttribute('prefill-values')
        }
    }
}

customElements.define('saw-upsert-habit-modal', UpsertHabitModal)

export { UpsertHabitModal }
