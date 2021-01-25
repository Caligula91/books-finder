import axios from 'axios';
import { showAlert } from './alert';

export default async function login(data, loginForm, btn)  {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data,
        });
        if (response.data.status === 'success') {
            // 1. Show alert that user is signuped
            showAlert(response.data.status, 'Logged In Successfully');
            btn.textContent = 'Done :)';
            // 2. Redirect to home page after short delay
            window.setTimeout(() => {
                location.assign('/');
            }, 2000);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
        if (error.response.data.problemFields && Object.keys(error.response.data.problemFields).length > 0) {
            Object.entries(error.response.data.problemFields).forEach(([key, value]) => {
                const inputDom = loginForm.querySelector(`input[name=${key}]`);
                inputDom.style.border = "red 1px solid";
                document.querySelector('.auth-errors').innerHTML += `${value}<br />`;
            });  
        } else {
            loginForm.querySelector('input[name="email"]').style.border = "red 1px solid";
            loginForm.querySelector('input[name="password"]').style.border = "red 1px solid";
            document.querySelector('.auth-errors').innerHTML = error.response.data.message;
            btn.textContent = 'Log In';
            btn.disabled = false;
        }
    }
}