// Every screen of the app. The app routes to them (/#/<id> on web) and the
// rendered design checks (design-rules/rendered) visit each one.

export const screens = [
  { id: 'settings', title: 'Settings', load: () => import('./Settings.jsx') },
  { id: 'product', title: 'Product detail', load: () => import('./Product.jsx') },
  { id: 'confirm-dialog', title: 'Confirm dialog', load: () => import('./ConfirmDialog.jsx') },
  { id: 'checkout', title: 'Checkout (breaks the rules)', load: () => import('./Checkout.jsx') },
  { id: 'promo', title: 'Promo dialog (breaks the rules, only visible when rendered)', load: () => import('./Promo.jsx') },
]
