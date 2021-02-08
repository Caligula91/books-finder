import '@babel/polyfill';
import '../js/slide';
import login from './login';
import signup from './signup'
import { addBook, removeBook } from './wishlist';
import updateTopBooks from './updateTopBooks';
import  sendContactMessage  from './sendContactMessage';
import * as passwordReset from './passwordReset';
import * as updateUser from './updateUser';

/**
 * DOM 
 */
const contactForm = document.querySelector('.contact-form');
const searchForm = document.querySelector('.search-form');
const selectOptions = document.getElementById('per_page');
const checkBox = document.querySelector('.filters-select');
const signupForm = document.querySelector('.signup-form');
const loginForm = document.querySelector('.login-form');
const addWishList = document.querySelectorAll('.addWishList');
const updateTopBooksBtn = document.querySelector('.update-top-books-btn');
const passwordForgotForm = document.querySelector('.password-forgot-form');
const passwordResetForm = document.querySelector('.password-reset-form');
const updateUserForm = document.querySelector('.update-user-form');
const updatePasswordForm = document.querySelector('.update-password-form');

/**
 * QUERY STRING
 */
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

/**
 * DELEGATION
 */
if (contactForm) {
    contactForm.addEventListener('submit', event => {
        event.preventDefault();
        const btn = contactForm.querySelector('.contact-btn');
        btn.textContent = 'Sending...';
        btn.disabled = true;
        const email = contactForm.querySelector('input[name="email"]').value.trim();
        const message = contactForm.querySelector('textarea[name="message"]').value.trim();
        sendContactMessage({ email, message }, btn, contactForm);
    })
}

if (selectOptions) {
    if (urlParams.has('limit')) {
        const limits = [12, 24, 36, 48];
        let limit = parseInt(urlParams.get('limit'), 10);
        limit = (limits.includes(limit))?limit:48;
        selectOptions.options[limit/12 - 1].selected = 'selected';
    }
}

if (checkBox) {
    if (urlParams.has('select')) {
        const selectArr = urlParams.getAll('select')[0].split(' ');
        if (selectArr.length > 1 || selectArr[0] !== '') {
            checkBox.querySelectorAll('input').forEach(el => {
                el.checked = selectArr.includes(el.name);
            });
        }
    } 
}

if (searchForm) {
    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        const input = document.querySelector('.search-input').value.trim();
        if (input === '') return;
        const limit = (selectOptions)?document.getElementById('per_page').value:48;
        const select = (checkBox)?Array.from(checkBox.querySelectorAll('input')).reduce((acc, curr) => {
                return (curr.checked)?acc+curr.value+'+':acc;
            }, '').slice(0, -1):'';
        location.assign(`/pretraga?search=${input}&limit=${limit}&select=${select}`);
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        document.querySelector('.auth-errors').innerHTML = '';
        signupForm.querySelectorAll('input').forEach(el => {
            el.style.border = '';
        });
        const searchButton = document.querySelector('.signup-btn');
        searchButton.textContent = 'Processing...';
        searchButton.disabled = true;
        const name = signupForm.querySelector('input[name="name"]').value.trim();
        const email = signupForm.querySelector('input[name="email"]').value.trim();
        const password = signupForm.querySelector('input[name="password"]').value;
        const passwordConfirm = signupForm.querySelector('input[name="passwordConfirm"]').value;
        signup({name, email, password, passwordConfirm}, signupForm, searchButton);
    });
    signupForm.querySelectorAll('input').forEach(el => {
        el.addEventListener('focus', e => {
            e.target.style.border = '';
        });
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        document.querySelector('.auth-errors').innerHTML = '';
        loginForm.querySelectorAll('input').forEach(el => {
            el.style.border = '';
        });
        const loginButton = document.querySelector('.login-btn');
        loginButton.textContent = 'Processing...';
        loginButton.disabled = true;
        const password = loginForm.querySelector('input[name="password"]').value;
        const email = loginForm.querySelector('input[name="email"]').value.trim();
        login({email, password}, loginForm, loginButton);
    });
    loginForm.querySelectorAll('input').forEach(el => {
        el.addEventListener('focus', e => {
            e.target.style.border = '';
        });
    });
}

if (addWishList.length > 0) {
    const likeHandler = (event) => {
        if (event.target.classList.contains('addWishList')) {
            event.preventDefault();
            if (event.target.classList.contains('far')) {
                event.preventDefault();
                addBook(event.target);
            } else if (event.target.classList.contains('fas')) {
                event.preventDefault();
                removeBook(event.target);
            }
        }
    }
    document.body.addEventListener('click', likeHandler);
}

if (updateTopBooksBtn) {
    updateTopBooksBtn.addEventListener('click', event => {
        event.preventDefault();
        updateTopBooksBtn.disabled = true;
        updateTopBooksBtn.textContent = 'Processing....'
        const paragraphDom = document.querySelector('.top-books-update-info'); 
        updateTopBooks(paragraphDom, updateTopBooksBtn);
    });
}

if (passwordForgotForm) {
    passwordForgotForm.addEventListener('submit', event => {
        const sendBtn = passwordForgotForm.querySelector('.send-btn');
        sendBtn.textContent = 'Sending...';
        sendBtn.disabled = true;
        event.preventDefault();
        const email = passwordForgotForm.querySelector('input[name="email"]').value.trim().toLowerCase();
        passwordReset.sendEmail(email, sendBtn);
    });
}

if (passwordResetForm) {
    passwordResetForm.addEventListener('submit', event => {
        event.preventDefault();
        const resetBtn = passwordResetForm.querySelector('.reset-password-btn');
        resetBtn.textContent = 'Processing...';
        resetBtn.disabled = true;
        const password = passwordResetForm.querySelector('input[name="password"]').value.trim();
        const passwordConfirm = passwordResetForm.querySelector('input[name="passwordConfirm"]').value.trim();
        const token = passwordResetForm.dataset.token;
        passwordReset.resetPassword({ password, passwordConfirm }, token, resetBtn, passwordResetForm);
    });
    passwordResetForm.querySelectorAll('input').forEach(el => {
        el.addEventListener('focus', e => {
            e.target.style.border = '';
        });
    });
}

if (updateUserForm) {
    updateUserForm.addEventListener('submit', event => {
        event.preventDefault();
        const updateBtn = updateUserForm.querySelector('.update-user-btn');
        updateBtn.textContent = 'Processing...';
        updateBtn.disabled = true;
        const name = updateUserForm.querySelector('input[name="name"]').value.trim();
        updateUser.updateName({name}, updateBtn, updateUserForm);
    });
    updateUserForm.querySelectorAll('input').forEach(el => {
        el.addEventListener('focus', e => {
            e.target.style.border = '';
        })
    });
}

if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', event => {
        event.preventDefault();
        const updateBtn = updatePasswordForm.querySelector('.update-password-btn');
        updateBtn.textContent = 'Processing...';
        updateBtn.disabled = true;
        const currentPassword = updatePasswordForm.querySelector('input[name="currentPassword"]').value.trim();
        const newPassword = updatePasswordForm.querySelector('input[name="password"]').value.trim();
        const newPasswordConfirm = updatePasswordForm.querySelector('input[name="passwordConfirm"]').value.trim();
        updateUser.updatePassword({ currentPassword, newPassword, newPasswordConfirm }, updateBtn, updatePasswordForm);
    });
    updatePasswordForm.querySelectorAll('input').forEach(el => {
        el.addEventListener('focus', e => {
            e.target.style.border = '';
        })
    });
}