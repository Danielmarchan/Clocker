const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Product = require('../models/product');
const Order = require('../models/order');
const Collection = require('../models/collection');

const mongoose = require('mongoose');

const ITEMS_PER_PAGE = 8;


exports.getShopCollection = (req, res, next) => {
  let cartQty = 0;
let isAdmin = false
let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  const page = +req.query.page || 1;
  let totalItems;
  const collectionHandle = req.params.collectionHandle;

  Collection.findOne({handle: collectionHandle})
  .populate('products')
  .then(collection => {
      console.log(collection);
      const totalItems = collection.products.length;
      const beginningIndex = (page - 1) * ITEMS_PER_PAGE;
      const endingIndex = beginningIndex + ITEMS_PER_PAGE;
      const productsToDisplay = collection.products.slice(beginningIndex, endingIndex);

      Collection.find()
      .then(collections => {
          res.render('shop/product-list', {
            cartQty: cartQty,
            prods: productsToDisplay,
            pageTitle: collection.title,
            collections: collections,
            path: '/products',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            isAdmin: isAdmin,
            userEmail: userEmail
          });
      })
      .catch(err => {
        const error = new Error(err);
        console.log(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  })
  .catch(err => {
    const error = new Error(err);
    console.log(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProduct = (req, res, next) => {
  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }
  const productHandle = req.params.productHandle;
  Product.findOne({handle: productHandle})
    .then(product => {
      res.render('shop/product-detail', {
        cartQty: cartQty,
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAdmin: isAdmin,
        userEmail: userEmail
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }
  res.render('shop/index', {
    cartQty: cartQty,
    pageTitle: 'Clocker - Exceptionally Crafted Watches. Fairly Priced.',
    path: '/',
    isAdmin: isAdmin,
    userEmail: userEmail
  });
};

exports.getCart = (req, res, next) => {
  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  let products;
  let total = 0;

  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      products = user.cart.items;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      if (products.length > 0) {
        return stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: products.map(p => {
            return {
              name: p.productId.title,
              description: p.productId.description,
              amount: p.productId.price * 100,
              currency: 'usd',
              quantity: p.quantity
            };
          }),
          success_url: 'http://localhost:3000/checkout/success',
          cancel_url: 'http://localhost:3000/checkout/cancel'
        });
      }
      else {
        return {id: ''};
      }
    })
    .then(session => {
      console.log(session);
      res.render('shop/cart', {
        cartQty: cartQty,
        path: '/cart',
        pageTitle: 'Cart',
        products: products,
        totalSum: total,
        sessionId: session.id,
        isAdmin: isAdmin,
        userEmail: userEmail
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutCancel = (req, res, next) => {
  res.redirect('/cart');
};

exports.postCart = (req, res, next) => {

  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  const prodId = req.body.productId;

  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postUpdateCart = (req, res, next) => {

  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  const updatedCart = req.body.updatedCart;

  let validateQty = true;

  updatedCart.items.forEach(item => {
    if (item.quantity < 1) {
      validateQty = false;
    }
  });

  if (validateQty) {
    req.user.cart = updatedCart;
    req.user.save()
    .then(result => {
      return res.redirect('/cart');
    })
  }
  else {
    return res.redirect('/cart');
  }
}

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.params.prodId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  let totalSum = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      user.cart.items.forEach(p => {
        totalSum += p.quantity * p.productId.price;
      });

      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      console.log(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postOrder = (req, res, next) => {
//   // Token is created using Checkout or Elements!
//   // Get the payment token ID submitted by the form:
//   const token = req.body.stripeToken; // Using Express
//   let totalSum = 0;
//
//   req.user
//     .populate('cart.items.productId')
//     .execPopulate()
//     .then(user => {
//       user.cart.items.forEach(p => {
//         totalSum += p.quantity * p.productId.price;
//       });
//
//       const products = user.cart.items.map(i => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });
//       const order = new Order({
//         user: {
//           email: req.user.email,
//           userId: req.user
//         },
//         products: products
//       });
//       return order.save();
//     })
//     .then(result => {
//       const charge = stripe.charges.create({
//         amount: totalSum * 100,
//         currency: 'usd',
//         description: 'Demo Order',
//         source: token,
//         metadata: { order_id: result._id.toString() }
//       });
//       return req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect('/orders');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.getOrders = (req, res, next) => {
  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      const ordersWithTotal = orders.map(order => {
        let total = 0;
        order.products.forEach(orderLineItem => {
          total += orderLineItem.product.price * orderLineItem.quantity;
        })
        order.total = total;
        return order;
      });
      res.render('shop/orders', {
        cartQty: cartQty,
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: ordersWithTotal,
        isAdmin: isAdmin,
        userEmail: userEmail
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {

  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.product.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
};
