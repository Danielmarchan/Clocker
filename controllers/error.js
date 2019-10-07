exports.get404 = (req, res, next) => {
  let cartQty = 0;

  if (req.user) {
    cartQty = req.user.cart.items.length;
  }

  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    cartQty: cartQty,
    path: '/404',
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.get500 = (req, res, next) => {
  let cartQty = 0;

  if (req.user) {
    cartQty = req.user.cart.items.length;
  }

  res.status(500).render('500', {
    pageTitle: 'Error!',
    cartQty: cartQty,
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
};
