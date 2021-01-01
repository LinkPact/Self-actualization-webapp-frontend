import '../../components/upsert-value-modal.js'

document.getElementById('open-add-value-modal-button').addEventListener('click', () => {
    const modal = document.createElement('saw-upsert-value-modal')
    modal.addEventListener('saw.modal-submit', (e) => {
        console.log(e.detail.input)
    })
    modal.addEventListener('saw.modal-close', (e) => document.body.removeChild(modal))
    document.body.appendChild(modal)
})

document.getElementById('open-edit-value-modal-button').addEventListener('click', () => {
    const modal = document.createElement('saw-upsert-value-modal')
    modal.addEventListener('saw.modal-submit', (e) => {
        console.log(e.detail.input)
    })
    modal.addEventListener('saw.modal-close', (e) => document.body.removeChild(modal))
    modal.setAttribute('prefill-name', 'TestPrefillName')
    modal.setAttribute('prefill-description', 'TestPrefillDescription')
    document.body.appendChild(modal)
})
