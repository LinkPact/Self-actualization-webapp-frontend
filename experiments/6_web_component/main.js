import '../../components/saw-add-value-modal.js'

document.getElementById('open-add-value-modal-button').addEventListener('click', () =>
    document.body.appendChild(document.createElement('saw-add-value-modal'))
)
