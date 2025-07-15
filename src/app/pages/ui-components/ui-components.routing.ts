import { Routes } from '@angular/router';

// ui
import { AppBadgeComponent } from './badge/badge.component';
import { AppChipsComponent } from './chips/chips.component';
import { AppListsComponent } from './lists/lists.component';
import { AppMenuComponent } from './menu/menu.component';
import { AppTooltipsComponent } from './tooltips/tooltips.component';
import { AddProductComponent } from './add-product/add-product.component';
import { ProductListComponent } from './product-list/product-list.component';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { ManageCarrouselComponent } from './carousel/manage-carrousel/manage-carrousel.component';
import { NewsLetterComponent } from './newsLetter/news-letter/news-letter.component';
import { NoteListComponent } from './note/note-list/note-list.component';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { WebinfoComponent } from './webinfo/webinfo.component';
import { ContactMessagesComponent } from './contact-messages/contact-messages.component';

export const UiComponentsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'addProduct',
        component: AddProductComponent,
      },
      {
        path: 'ProductList',
        component: ProductListComponent,
      },
      {
        path: 'OrdersList',
        component: OrdersListComponent,
      },
      {
        path: 'menu',
        component: AppMenuComponent,
      },
      {
        path: 'tooltips',
        component: AppTooltipsComponent,
      },
      {
        path: 'carrousel',
        component: ManageCarrouselComponent,
      },
      {
        path: 'newsletter',
        component: NewsLetterComponent,
      },
      {
        path: 'note',
        component: NoteListComponent,
      },
      {
        path: 'category',
        component: CategoryListComponent,
      },
      {
        path:'webinfo',
        component: WebinfoComponent
      },
      {
        path:'contactMessages',
        component: ContactMessagesComponent
      }
    ],
  },
];
