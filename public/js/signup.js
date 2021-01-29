import axios from 'axios';
import { showAlert } from './alert';

// WHEN RESPONsE IS 500 ITS AUTOMATICLY TREATED AS ERROR (ACCESS RESPONSE error.response.data)
export default async function signup(data, signupForm, btn) {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data,
        });
        if (response.data.status === 'success') {
            // 1. Show alert that user is signuped
            showAlert(response.data.status, 'Signed Up Successfully');
            btn.textContent = 'Done :)';
            // 2. Redirect to home page after short delay
            window.setTimeout(() => {
                location.assign('/');
            }, 1250);
        } 
    } catch (error) {
        showAlert('error', error.response.data.message);
        if (error.response.data.problemFields) {
            Object.entries(error.response.data.problemFields).forEach(([key, value]) => {
                const inputDom = signupForm.querySelector(`input[name=${key}]`);
                inputDom.style.border = "red 1px solid";
                document.querySelector('.auth-errors').innerHTML += `${value}<br />`;
            });  
        }
        btn.textContent = 'Sign Up';
        btn.disabled = false;
    }
}