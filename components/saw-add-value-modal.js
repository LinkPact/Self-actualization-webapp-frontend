import 'https://unpkg.com/@polymer/paper-dialog/paper-dialog.js?module'

class SawAddValueModal extends HTMLElement {
    connectedCallback () {
        const dialog = this._createModal()
        this.appendChild(dialog)
        dialog.open()
    }

    _createModal () {
        const dialog = document.createElement('paper-dialog')
        const wrapper = document.createElement('div')
        const title = document.createElement('h3')
        const nameLabel = document.createElement('label')
        const nameInput = document.createElement('input')
        const descLabel = document.createElement('label')
        const descInput = document.createElement('textarea')
        const addButton = document.createElement('button')

        title.appendChild(document.createTextNode('Add Value'))
        nameLabel.setAttribute('for', 'value_name_input')
        nameLabel.appendChild(document.createTextNode('Name: '))
        nameLabel.setAttribute('id', 'value_name_input')
        nameInput.setAttribute('type', 'text')
        nameInput.setAttribute('name', 'Input value name')
        descLabel.setAttribute('for', 'value_description_input')
        descLabel.appendChild(document.createTextNode('Description: '))
        descInput.setAttribute('id', 'value_description_input')
        addButton.appendChild(document.createTextNode('Add value'))

        // TODO: Pass callback with attribute
        addButton.addEventListener('click', () => {
            console.log('clicked')
        })

        nameLabel.appendChild(nameInput)
        descLabel.appendChild(descInput)
        wrapper.appendChild(title)
        wrapper.appendChild(nameLabel)
        wrapper.appendChild(descLabel)
        wrapper.appendChild(addButton)
        dialog.appendChild(wrapper)

        return dialog
    }
}

customElements.define('saw-add-value-modal', SawAddValueModal)

export { SawAddValueModal }
