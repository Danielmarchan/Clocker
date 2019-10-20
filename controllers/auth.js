const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');


const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);

exports.getLogin = (req, res, next) => {
let cartQty = 0;
let isAdmin = false
let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    cartQty: cartQty,
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: [],
    isAdmin: isAdmin,
    userEmail: userEmail
  });
};

exports.getSignup = (req, res, next) => {

  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    cartQty: cartQty,
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: [],
    isAdmin: isAdmin,
    userEmail: userEmail
  });
};

exports.postLogin = (req, res, next) => {

  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      cartQty: cartQty,
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array(),
      isAdmin: isAdmin,
      userEmail: userEmail
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: [],
          isAdmin: isAdmin,
          userEmail: userEmail
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: [],
            isAdmin: isAdmin,
            userEmail: userEmail
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      cartQty: cartQty,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array(),
      isAdmin: isAdmin,
      userEmail: userEmail
    });
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
        isAdmin: false
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      // return transporter.sendMail({
      //   to: email,
      //   from: 'shop@node-complete.com',
      //   subject: 'Signup succeeded!',
      //   html: '<h1>You successfully signed up!</h1>'
      // });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    cartQty: cartQty,
    pageTitle: 'Reset Password',
    errorMessage: message,
    isAdmin: isAdmin,
    userEmail: userEmail
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'shop@clocker.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://shopclocker.herokuapp.com/reset/${token}">link</a> to set a new password.</p>
          `
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {

    let cartQty = 0;
    let isAdmin = false;
    let userEmail = "";

    if (req.user) {
      cartQty = req.user.cart.items.length;
      isAdmin = req.user.isAdmin;
      userEmail = req.user.email;
    }

  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        cartQty: cartQty,
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
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

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
