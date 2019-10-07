const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/ => GET
router.get('/', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-product',
  [
    body('title')
      .isString()
      .trim(),
    body('price').isFloat(),
    body('description')
      .trim()
  ],
  isAuth,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  [
    body('title')
      .isString()
      .trim(),
    body('price').isFloat(),
    body('description')
      .trim()
  ],
  isAuth,
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

// /admin/collections => GET
router.get('/collections', isAuth, adminController.getCollections);

// /admin/add-product => POST
router.post(
  '/add-collection',
  [
    body('title')
      .not().isEmpty().withMessage('Must enter collection title')
      .isString()
      .trim()
  ],
  isAuth,
  adminController.postAddCollection
);

router.delete('/collections/:collectionId', isAuth, adminController.deleteCollection);

module.exports = router;
