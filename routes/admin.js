const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth').isAuth;
const isAdmin = require('../middleware/is-auth').isAdmin;

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, isAdmin, adminController.getAddProduct);

// /admin/ => GET
router.get('/', isAuth, isAdmin, adminController.getProducts);

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

router.get('/users', isAuth, isAdmin, adminController.getUsers);

router.post('/users', isAuth, isAdmin, adminController.postChangeUserRole);

router.get('/edit-product/:productId', isAuth, isAdmin, adminController.getEditProduct);

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
  isAdmin,
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, isAdmin, adminController.deleteProduct);

// /admin/collections => GET
router.get('/collections', isAuth, isAdmin, adminController.getCollections);

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
  isAdmin,
  adminController.postAddCollection
);

router.delete('/collections/:collectionId', isAuth, isAdmin, adminController.deleteCollection);

module.exports = router;
