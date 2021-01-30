import axios from 'axios';
import { showAlert } from './alert';

const setWishListSize = (wishListSize) => {
    const dom = document.getElementById('user-wish-list');
    dom.textContent = `WISHLIST(${wishListSize})`;
}
const addHeart = (dom) => {
    dom.classList.remove('far');
    dom.classList.add('fas');
}
const removeHeart = (dom) => {
    dom.classList.remove('fas');
    dom.classList.add('far');  
}

export async function addBook(dom) {
    try {
        addHeart(dom);
        const { title, author, url, image, price, onlinePrice, source } = dom.dataset;
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/wishbook',
            data: {
                title: (title !== 'undefined')?title:undefined,
                author: (author !== 'undefined')?author:undefined,
                url,
                image: (image !== 'undefined')?image:undefined,
                source: (source !== 'undefined')?source:undefined,
                price: (price !== 'undefined')?price:undefined,
                onlinePrice: (onlinePrice !== 'undefined')?onlinePrice:undefined,
            }
        });
        if (response.data.status === 'success') {
            showAlert(response.data.status, 'Book Added to WishList', 3000);
            setWishListSize(response.data.data.wishListSize);
        }
    } catch (error) {
        if (error.response.data.message === 'Book already in Wish List') {
            showAlert('success', error.response.data.message, 300);
        } else {
            showAlert('error', error.response.data.message, 3000);
            removeHeart(dom);
        }
    }
}

export async function removeBook(dom) {
    try {
        removeHeart(dom);
        const { url } = dom.dataset;
        const response = await axios({
            method: 'DELETE',
            url: '/api/v1/users/wishbook',
            data: {
                url,
            }
        });
        if (response.data.status === 'success') {
            showAlert('success', 'Book Removed from WishList', 3000);
            setWishListSize(response.data.data.wishListSize);
        }
    } catch (error) {
        showAlert('error', 'Failed to Remove Book from WishList', 3000);
        addHeart(dom);
    }
}