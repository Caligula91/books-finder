import axios from 'axios';
import { showAlert } from './alert';

export default async function(data, btn, form) {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/contact/send-message',
            data,
        });
        if (response.data.status === 'success') {
            showAlert(response.data.status, 'Message sent, thank you for your support', 3000);
            form.querySelector('input[name="email"]').value = '';
            form.querySelector('textarea[name="message"]').value = '';
        }
    } catch (error) {
        showAlert('error', 'Problem with sending, try again later');
    } finally {
        btn.textContent = 'Send';
        btn.disabled = false;
    }
}