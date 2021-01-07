import '@babel/polyfill';
/**
 * DOM 
 */
const searchButton = document.querySelector('.nav__search-btn');
const selectOptions = document.getElementById('per_page');
const checkBox = document.querySelector('.nav__select');

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

if (searchButton) {
    searchButton.addEventListener('click', event => {
        event.preventDefault()
        const input = document.querySelector('.nav__search-input').value.trim();
        const limit = (selectOptions)?document.getElementById('per_page').value:48;
        const select = (checkBox)?Array.from(checkBox.querySelectorAll('input')).reduce((acc, curr) => {
                return (curr.checked)?acc+curr.value+'+':acc;
            }, '').slice(0, -1):'';
        location.assign(`/pretraga?search=${input}&limit=${limit}&select=${select}`);
    });
}