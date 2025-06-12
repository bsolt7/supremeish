// === Floating Cart Icon with Real Mini Cart + Subtotal ===
function createFloatingCartIcon() {
  const floatingIcon = document.createElement('div');
  floatingIcon.id = 'floating-cart-icon';
  floatingIcon.style.display = 'none';
  floatingIcon.style.position = 'fixed';
  floatingIcon.style.top = '30px';
  floatingIcon.style.right = '30px';
  floatingIcon.style.zIndex = '9999';
  floatingIcon.innerHTML = `
    <div style="position: relative;">
      <button id="floating-cart-button" style="
        background-color: white;
        border: 1px solid black;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition: all 0.4s ease;
        opacity: 0;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="black" width="22" height="22">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7M7 13l-1.6 8h12.4l-1.6-8M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        <span id="floating-cart-count" style="
          position: absolute;
          top: -6px;
          right: -6px;
          background: red;
          color: white;
          font-size: 10px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 1px solid white;
        ">0</span>
      </button>
      <div id="mini-cart" style="
        opacity: 0;
        visibility: hidden;
        position: absolute;
        top: 55px;
        right: 0;
        width: 320px;
        background: white;
        border: 1px solid black;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        font-family: Courier, monospace;
        font-size: 13px;
        padding: 12px;
        z-index: 9999;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      ">
        <div id="mini-cart-content">Loading...</div>
      </div>
    </div>
  `;
  document.body.appendChild(floatingIcon);
  bindCartEvents();
}

function bindCartEvents() {
  const cartButton = document.getElementById('floating-cart-button');
  const miniCart = document.getElementById('mini-cart');
  if (!cartButton || !miniCart) return;

  let timer;
  function showMiniCart() {
    clearTimeout(timer);
    miniCart.style.opacity = '1';
    miniCart.style.visibility = 'visible';
    fetchMiniCart();
  }
  function hideMiniCart() {
    timer = setTimeout(() => {
      miniCart.style.opacity = '0';
      miniCart.style.visibility = 'hidden';
    }, 400);
  }

  cartButton.addEventListener('mouseenter', showMiniCart);
  cartButton.addEventListener('mouseleave', hideMiniCart);
  miniCart.addEventListener('mouseenter', () => clearTimeout(timer));
  miniCart.addEventListener('mouseleave', hideMiniCart);
  cartButton.addEventListener('click', () => window.location.href = '/cart');
}

function updateFloatingCartIcon(cartCount = 0) {
  const icon = document.getElementById('floating-cart-icon');
  const count = document.getElementById('floating-cart-count');
  if (!icon || !count) return;

  icon.style.display = 'block';
  count.textContent = cartCount;
  setTimeout(() => {
    const btn = document.getElementById('floating-cart-button');
    if (btn) btn.style.opacity = '1';
  }, 200);
}

function fetchCartAndUpdateIcon(force = false) {
  fetch('/cart.js', { cache: force ? 'reload' : 'default' })
    .then(response => response.json())
    .then(cart => {
      localStorage.setItem('cart_item_count', cart.item_count || 0);
      updateFloatingCartIcon(cart.item_count || 0);
    })
    .catch(error => console.error('Error fetching cart:', error));
}

function fetchMiniCart() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const box = document.getElementById('mini-cart-content');
      if (!box) return;
      if (cart.item_count === 0) {
        box.innerHTML = '<p style="text-align: center;">Your cart is empty.</p>';
        return;
      }
      box.innerHTML = cart.items.map(item => `
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <a href="${item.url}" style="margin-right: 12px;"><img src="${item.image}" alt="${item.product_title}" style="width: 55px; height: auto;"></a>
          <div style="flex: 1;">
            <a href="${item.url}" style="text-decoration: none; color: black; font-size: 14px;">${item.product_title}</a>
            <div style="font-size: 12px; color: grey;">Qty: ${item.quantity}</div>
            <div style="font-size: 12px;">$${(item.line_price / 100).toFixed(2)}</div>
            <a href="#" data-key="${item.key}" class="mini-cart-remove" style="background: red; color: white; padding: 6px 10px; font-size: 12px; text-decoration: none; margin-top: 8px; display: inline-block; border-radius: 4px;">Remove</a>
          </div>
        </div>`).join('') + `
        <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px; font-size: 13px; text-align: right;"><strong>Subtotal: $${(cart.total_price / 100).toFixed(2)}</strong></div>
        <div style="margin-top: 12px; text-align: center;">
          <a href="/cart" style="background: black; color: white; padding: 10px 20px; margin: 4px; font-size: 12px; text-decoration: none; display: inline-block;">View Cart</a>
          <a href="/checkout" style="background: red; color: white; padding: 10px 20px; margin: 4px; font-size: 12px; text-decoration: none; display: inline-block;">Checkout</a>
        </div>`;

      box.querySelectorAll('.mini-cart-remove').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const key = link.dataset.key;
          fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: key, quantity: 0 })
          })
            .then(() => {
              fetchMiniCart();
              fetchCartAndUpdateIcon(true);
              document.dispatchEvent(new CustomEvent('cart:updated'));
            });
        });
      });
    })
    .catch(error => console.error('Error loading mini-cart:', error));
}

function setupAddToCartForms() {
  document.querySelectorAll('form[action^="/cart/add"]').forEach(form => {
    if (form.dataset.bound) return;
    form.dataset.bound = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(response => response.json())
        .then(data => {
          console.log('Item added to cart:', data);
          setTimeout(() => {
            fetchCartAndUpdateIcon(true);
            document.dispatchEvent(new CustomEvent('cart:updated'));
          }, 400);
        })
        .catch(error => console.error('Error adding to cart:', error));
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.body.classList.add('loaded');
  createFloatingCartIcon();
  setupAddToCartForms();
  fetchCartAndUpdateIcon();
});

window.addEventListener('pageshow', e => {
  if (e.persisted || performance.getEntriesByType('navigation')[0].type === 'back_forward') {
    fetchCartAndUpdateIcon(true);
  }
});

window.addEventListener('popstate', () => {
  fetchCartAndUpdateIcon(true);
});

document.addEventListener('cart:updated', () => {
  updateFloatingCartIcon(parseInt(localStorage.getItem('cart_item_count')) || 0);
});
