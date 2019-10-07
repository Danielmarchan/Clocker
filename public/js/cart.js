const deleteCartItem = btn => {
  const cartItemElement = btn.parentNode.closest('.cart__item');
  const prodId = cartItemElement.getAttribute('productId');
  const csrf = cartItemElement.getAttribute('csrf');

  fetch('/cart-delete-item/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      window.location.reload()
    })
    .catch(err => {
      console.log(err);
      window.location.reload()
    });
};

const updateCart = () => {
  const csrf = document.querySelector('#cart').getAttribute('csrf');
  const cartItemElements = document.querySelectorAll('li.cart__item');

  const items = [];

  cartItemElements.forEach(cartItemElement => {
  	const productId = cartItemElement.getAttribute('productId');
      const quantity = cartItemElement.querySelector('.cart-qty-input').value;

  	const cartItem = {productId: productId, quantity: quantity};

  	items.push(cartItem);
  });

  const updatedCart = {
    items: items
  };

  const data = {
    updatedCart: updatedCart
  };

  fetch('/cart/update', {
    method: 'POST',
    headers: {
      'csrf-token': csrf,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(result => {
      result.json()
    })
    .then(() => {
      window.location.reload()
    })
    .catch(err => {
      console.log(err);
    });
};
