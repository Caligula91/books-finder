import axios from 'axios';
import { showAlert } from './alert';

const displayEmailSent = (email) => {
    const authContent = document.querySelector('.auth-content');
    authContent.insertAdjacentHTML('beforebegin', `<h2 style="height: 40vh; text-align: center; padding-top: 100px">Email sent to ${email}, check your inbox!<br/>Check Spam Folder!</h2>`);
    authContent.style.display = 'none';
}

export const sendEmail = async (email, button) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/password-forgot',
            data: {
                email,
            },
        });
        if (response.data.status === 'success') {
            showAlert(response.data.status, `Email sent to ${email}, check your inbox`);
            displayEmailSent(email);
        }
    } catch (error) {
        // HIDE FROM USER IF EMAIL EXISTS OR NOT
        if (error.response.data.message === 'There is no user with given email') {
            showAlert(`Email sent to ${email}, check yout inbox`);
            displayEmailSent(email);
        } else {
            showAlert('error', 'Problem with sending email, please try again');
            document.querySelector('.auth-errors').innerHTML = `Problem with sending email<br />`;
            button.textContent = 'Send';
            button.disabled = false;
        }
    }
}

export const resetPassword = async (data, token, button, form) => {
    try { 
        const response = await axios({
            method: 'PATCH',
            url: `/api/v1/users/password-reset/${token}`,
            data,
        });
        if (response.data.status === 'success') {
            showAlert(response.data.status, 'Password reset');
            button.textContent = 'Done :)';
            window.setTimeout(() => {
                location.assign('/');
            }, 1250);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
        form.querySelector('input[name="password"]').style.border = "red 1px solid";
        form.querySelector('input[name="passwordConfirm"]').style.border = "red 1px solid";
        document.querySelector('.auth-errors').innerHTML = error.response.data.message;
        button.textContent = 'Reset Password';
        button.disabled = false;
    }
}