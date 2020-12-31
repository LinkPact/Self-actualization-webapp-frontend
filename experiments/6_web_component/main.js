import { SawAddValueModal } from '../../components/saw-add-value-modal.js'

document.getElementById('open-add-value-modal-button').addEventListener('click', () => {
    document.body.appendChild(new SawAddValueModal())
})
