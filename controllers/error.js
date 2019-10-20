exports.get404 = (req, res, next) => {
  let cartQty = 0;
  let isAdmin = false
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    cartQty: cartQty,
    path: '/404',
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.user.isAdmin || false
  });
};

exports.get500 = (req, res, next) => {
  let cartQty = 0;
  let isAdmin = false;
  let userEmail = "";

  if (req.user) {
    cartQty = req.user.cart.items.length;
    isAdmin = req.user.isAdmin;
    userEmail = req.user.email;
  }

  res.status(500).render('500', {
    pageTitle: 'Error!',
    cartQty: cartQty,
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: isAdmin,
    userEmail: userEmail,
    userEmail: userEmail
  });
};
