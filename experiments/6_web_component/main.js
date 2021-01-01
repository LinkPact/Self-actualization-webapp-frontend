import '../../components/saw-add-value-modal.js'

document.getElementById('open-add-value-modal-button').addEventListener('click', () => {
    const modal = document.createElement('saw-add-value-modal')
    modal.addEventListener('on-submit', (e) => {
        console.log(e.detail.input)
    })
    modal.addEventListener('on-close', (e) => document.body.removeChild(modal))
    document.body.appendChild(modal)
})
