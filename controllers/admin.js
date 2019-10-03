const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Product = require('../models/product');
const Collection = require('../models/collection');

exports.getAddProduct = (req, res, next) => {

    Collection.find({ userId: req.user._id })
    .then(collections => {
      res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        collections: collections,
        validationErrors: []
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });;
    })
};

exports.postAddProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description

  let handle = title.replace(/[\W_]+/g,"-").toLowerCase();

  let collectionId;
  if (req.body.collection == 'All') {
      collectionId = '5d902b98a503612438d1a405';
  }
  else {
      collectionId = req.body.collection;
  }

  const errors = validationResult(req);

  if (!image) {
      return Collection.find({ userId: req.user._id })
      .then(collections => {
      return res.status(422).render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: false,
        hasError: true,
        product: {
          title: title,
          price: price,
          description: description,
          collectionId: collectionId,
          _id: prodId
        },
        collections: collections,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      });

      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }

  if (!errors.isEmpty()) {

    return Collection.find({ userId: req.user._id })
    .then(collections => {
        return res.status(422).render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing: false,
          hasError: true,
          product: {
            title: title,
            price: price,
            description: description,
            collectionId: collectionId,
            _id: prodId
          },
          collections: collections,
          errorMessage: errors.array()[0].msg,
          validationErrors: errors.array()
        });

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  }

  const imageUrl = image.path;

  // CHECK IF HANDLE EXISTS, IF SO, ADD -2
  Product.find({ userId: req.user._id })
  .then(products => {
    if (products.find(p => p.handle == handle)) {
        handle += '-2';
    }
    const product = new Product({
      title: title,
      handle: handle,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.user,
      collectionId: collectionId
    });
    product
      .save()
      .then(result => {
          console.log('Created Product');
          res.redirect('/admin');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postAddCollection = (req, res, next) => {
  const title = req.body.title;
  let handle = title.replace(/[\W_]+/g,"-").toLowerCase();

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/collections', {
      pageTitle: 'Admin Collections',
      path: '/admin/add-collections',
      hasError: true,
      collection: {
        title: title
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Collection.find({ userId: req.user._id })
  .then(collections => {
      if (collections.find(c => c.handle == handle)) {
          handle += '-2';
      }
      const collection = new Collection({
        title: title,
        handle: handle,
        userId: req.user
      });
      collection
        .save()
        .then(result => {
          // console.log(result);
          console.log('Created Collection');
          res.redirect('/admin/collections');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/admin');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/admin');
      }

      Collection.find({ userId: req.user._id })
      .then(collections => {

      res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: null,
            collections: collections,
            validationErrors: []
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });;
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  let updatedHandle = updatedTitle.replace(/[\W_]+/g,"-").toLowerCase();

  let collectionId;
  if (req.body.collection == 'All') {
      collectionId = '5d902b98a503612438d1a405';
  }
  else {
      collectionId = req.body.collection;
  }
  console.log(image);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    Collection.find({ userId: req.user._id })
    .then(collections => {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        collectionId: collectionId,
        _id: prodId
      },
      collections: collections,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  }

  Product.find({ userId: req.user._id })
    .then(products => {
        if (products.find(p => p.handle == updatedHandle)) {
            updatedHandle += '-2';
        }
        Product.findById(prodId)
          .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
              return res.redirect('/admin');
            }
            product.title = updatedTitle;
            product.handle = updatedHandle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            product.collectionId = collectionId;
            if (image) {
              fileHelper.deleteFile(product.imageUrl);
              product.imageUrl = image.path;
            }
            return product.save().then(result => {
              console.log('UPDATED PRODUCT!');
              res.redirect('/admin');
            });
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/admin');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.collectionId = collectionId;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCollections = (req, res, next) => {
  Collection.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(collections => {
      console.log(collections);
      res.render('admin/collections', {
        collections: collections,
        pageTitle: 'Admin Collections',
        path: '/admin/collections',
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found.'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.status(200).json({ message: 'Success!' });
      res.redirect('/admin');
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting product failed.' });
    });
};

exports.deleteCollection = (req, res, next) => {
  const collectionId = req.params.collectionId;
  Collection.findById(collectionId)
    .then(collection => {
      if (!collection) {
        return next(new Error('Collection not found.'));
      }
      return Collection.deleteOne({ _id: collectionId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED COLLECTION');
      res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting collectino failed.' });
    });
};
