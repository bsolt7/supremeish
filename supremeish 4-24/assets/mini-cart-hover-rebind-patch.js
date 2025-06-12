// === mini-cart-hover-rebind-patch.js ===
// Fix: ensures floating mini-cart hover events are re-bound after back-nav

/* Utility: rebind hover events for floating mini-cart */
function rebindMiniCartHover() {
  // bindCartEvents is your existing function that wires up hover behavior
  if (typeof bindCartEvents === 'function') {
    bindCartEvents();
  }
}

// Enhanced refreshAllCartUI to rebind hover events
function refreshAllCartUI() {
  refreshStickyBanner();
  refreshMiniCartCount();
  rebindMiniCartHover();
}

// Hook into lifecycle events (replace existing calls to refreshAllCartUI)
if (document.readyState !== 'loading') {
  refreshAllCartUI();
} else {
  document.addEventListener('DOMContentLoaded', refreshAllCartUI);
}

window.addEventListener('pageshow', e => {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  if (e.persisted || nav.type === 'back_forward') {
    refreshAllCartUI();
  }
});

window.addEventListener('popstate', refreshAllCartUI);

document.addEventListener('cart:updated', refreshAllCartUI);
