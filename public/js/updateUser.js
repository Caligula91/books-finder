import axios from 'axios';
import { showAlert } from './alert';

export const updateName = async (data, btn, form) => {
    try {
        const response = await axios({
            method: 'PATCH',
            url: '/api/v1/users/update-me',
            data,
        });
        if (response.data.status === 'success') {
            showAlert(response.data.status, `Name changed, you are now: ${response.data.data.user.name}`);
            form.querySelectorAll('input').forEach(el => {
                el.style.border = '';
                el.value = '';
            });
            form.querySelector('.auth-errors').innerHTML = '';
            form.querySelector('.user-current-name').textContent = `Name: ${response.data.data.user.name}`;
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
        if (error.response.data.problemFields) {
            Object.entries(error.response.data.problemFields).forEach(([key, value]) => {
                const inputDom = form.querySelector(`input[name=${key}]`);
                inputDom.style.border = "red 1px solid";
                document.querySelector('.auth-errors').innerHTML += `${value}<br />`;
            });  
        }
    } finally {
        btn.textContent = 'Change Name';
        btn.disabled = false;
    }
}

export const updatePassword = async (data, btn, form) => {
    try {
        const response = await axios({
            method: 'PATCH',
            url: '/api/v1/users/password-update',
            data,
        });
        if (response.data.status === 'success') {
            showAlert(response.data.status, `Password changed`);
            form.querySelectorAll('input').forEach(el => {
                el.style.border = '';
                el.value = '';
            });
            form.querySelector('.auth-errors').innerHTML = '';
            form.querySelector('input[name="currentPassword"]').value = '';
            form.querySelector('input[name="password"]').value = '';
            form.querySelector('input[name="passwordConfirm"]').value = '';
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
        document.querySelector('.auth-errors').innerHTML = error.response.data.message;
    } finally {
        btn.textContent = 'Change Password';
        btn.disabled = false;
    }
}