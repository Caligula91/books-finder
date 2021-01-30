import axios from 'axios';
import { showAlert } from './alert';

export default async function(dom, btn) {
    try {
        const response = await axios({
            method: 'PATCH',
            url: '/api/v1/books/update-top-books',
        });
        if (response.data.status === 'success') {
            showAlert(response.data.status, 'Books Updated');
            dom.textContent = JSON.stringify(response.data.data.updateInfo);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'UPDATE ALL';
    }
}