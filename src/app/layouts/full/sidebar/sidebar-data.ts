import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-dashboard',    // ✔ Tabler: dashboard overview
    route: '/dashboard',
  },
  {
    navCap: 'UI Components',
  },
  {
    displayName: 'Add Product',
    iconName: 'shopping-cart-plus',  // ✔ Tabler: add-to-cart
    route: '/ui-components/addProduct',
  },
  {
    displayName: 'Product List',
    iconName: 'list',                // ✔ Tabler: simple list
    route: '/ui-components/ProductList',
  },
  {
    displayName: 'Orders List',
    iconName: 'receipt',             // ✔ Tabler: receipt/invoice
    route: '/ui-components/OrdersList',
  },
  {
    displayName: 'Manage Carousel',
    iconName: 'carousel-horizontal', // ✔ Tabler: horizontal carousel
    route: '/ui-components/carrousel',
  },
  {
    displayName: 'Newsletter',
    iconName: 'mail',                // ✔ Tabler: email/mail
    route: '/ui-components/newsletter',
  },
  {
    displayName: 'Note Management',
    iconName: 'note',                // ✔ Tabler: note
    route: '/ui-components/note',
  },
  {
    displayName: 'Category Management',
    iconName: 'category',            // ✔ Tabler: category
    route: '/ui-components/category',
  },
  {
    displayName: 'Web config',
    iconName: 'info',            // ✔ Tabler: category
    route: '/ui-components/webinfo',
  },
    {
    displayName: 'Messages',
    iconName: 'message',            // ✔ Tabler: category
    route: '/ui-components/contactMessages',
  },

];
