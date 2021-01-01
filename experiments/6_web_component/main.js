import '../../components/upsert-value-modal.js'

document.getElementById('open-upsert-value-modal-button').addEventListener('click', () => {
    const modal = document.createElement('saw-upsert-value-modal')
    modal.addEventListener('saw.modal-submit', (e) => {
        console.log(e.detail.input)
    })
    modal.addEventListener('saw.modal-close', (e) => document.body.removeChild(modal))
    document.body.appendChild(modal)
})
