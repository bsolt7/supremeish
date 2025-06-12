// === sticky-cart-back-nav-patch.js (Updated) ===
// Unified back-nav fix: keeps both left banner and mini-cart count in sync

// 1. Refresh left sticky banner
function refreshStickyBanner(){
  fetch('/cart.js',{cache:'reload'})
    .then(r=>r.json())
    .then(cart=>{
      const banner = document.getElementById('sticky-cart');
      if(!banner) return;

      if(cart.item_count === 0) {
        banner.style.opacity = '0';
        banner.style.pointerEvents = 'none';
        return;
      }

      banner.querySelector('#cart-count').textContent = cart.item_count;
      banner.querySelector('#cart-s').style.display = cart.item_count > 1 ? 'inline' : 'none';
      banner.querySelector('#cart-subtotal-amount').textContent = `$${(cart.total_price/100).toFixed(2)}`;
      banner.style.opacity = '1';
      banner.style.pointerEvents = 'auto';
    })
    .catch(console.error);
}

// 2. Refresh top-right mini-cart icon/count
defineRefreshMiniCartCount(); // ensure fetchCartAndUpdateIcon exists
function defineRefreshMiniCartCount(){
  if(typeof fetchCartAndUpdateIcon !== 'function') return;
  window.refreshMiniCartCount = function(){ fetchCartAndUpdateIcon(true); };
}

// 3. Combined refresh helper
function refreshAllCartUI(){
  refreshStickyBanner();
  if(window.refreshMiniCartCount) refreshMiniCartCount();
}

// 4. Hook into lifecycle
if(document.readyState !== 'loading') {
  refreshAllCartUI();
} else {
  document.addEventListener('DOMContentLoaded', refreshAllCartUI);
}

window.addEventListener('pageshow', e => {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  if(e.persisted || nav.type === 'back_forward') refreshAllCartUI();
});

window.addEventListener('popstate', refreshAllCartUI);

document.addEventListener('cart:updated', refreshAllCartUI);
