const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth').isAuth;

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/shop', (req, res, next) => {
    res.redirect('/shop/all');
});

router.get('/shop/:collectionHandle', shopController.getShopCollection);

router.get('/product/:productHandle', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart/update', isAuth, shopController.postUpdateCart);

router.delete('/cart-delete-item/:prodId', isAuth, shopController.deleteCartItem);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.get('/checkout/cancel', shopController.getCheckoutCancel);


router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
