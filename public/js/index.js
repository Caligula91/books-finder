import '@babel/polyfill';
import '../js/slide';
import login from './login';
import signup from './signup'
import { addBook, removeBook } from './wishlist';
import updateTopBooks from './updateTopBooks';

/**
 * DOM 
 */
const searchForm = document.querySelector('.search-form');
const selectOptions = document.getElementById('per_page');
const checkBox = document.querySelector('.filters-select');
const signupForm = document.querySelector('.signup-form');
const loginForm = document.querySelector('.login-form');
const addWishList = document.querySelectorAll('.addWishList');
const updateTopBooksBtn = document.querySelector('.update-top-books-btn');

/**
 * QUERY STRING
 */
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

/**
 * DELEGATION
 */
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
        const searchButton = document.querySelector('.signup-btn');
        searchButton.textContent = 'Processing...';
        searchButton.disabled = true;
        const name = signupForm.querySelector('input[name="name"]').value.trim();
        const email = signupForm.querySelector('input[name="email"]').value.trim();
        const password = signupForm.querySelector('input[name="password"]').value.trim();
        const passwordConfirm = signupForm.querySelector('input[name="passwordConfirm"]').value.trim();
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
        const loginButton = document.querySelector('.login-btn');
        loginButton.textContent = 'Processing...';
        loginButton.disabled = true;
        const password = loginForm.querySelector('input[name="password"]').value.trim();
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
        const paragraphDom = document.querySelector('.updateInfo'); 
        updateTopBooks(paragraphDom, updateTopBooksBtn);
    });
}