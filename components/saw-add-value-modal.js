import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

class SawAddValueModal extends HTMLElement {
    constructor () {
        super()

        const dialog = this._createModal()
        this.appendChild(dialog)
        dialog.open()
    }

    _createModal () {
        const dialog = document.createElement('paper-dialog')
        dialog.appendChild(document.createTextNode('hello world'))
        return dialog
    }
}

customElements.define('saw-add-value-modal', SawAddValueModal)

export { SawAddValueModal }
