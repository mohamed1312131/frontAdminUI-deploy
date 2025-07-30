import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

import { UiComponentsRoutes } from './ui-components.routing';

// ui components
import { AppBadgeComponent } from './badge/badge.component';
import { AppChipsComponent } from './chips/chips.component';
import { AppListsComponent } from './lists/lists.component';
import { AppMenuComponent } from './menu/menu.component';
import { AppTooltipsComponent } from './tooltips/tooltips.component';
import { MatNativeDateModule } from '@angular/material/core';
import { AddProductComponent } from './add-product/add-product.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import {MatChipsModule} from '@angular/material/chips';
import { UpdateProductComponent } from './update-product/update-product.component';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { ManageCarrouselComponent } from './carousel/manage-carrousel/manage-carrousel.component';
import { NewsLetterComponent } from './newsLetter/news-letter/news-letter.component';
import { EmailComposerDialogComponent } from './newsLetter/email-composer-dialog/email-composer-dialog.component';
import { NoteListComponent } from './note/note-list/note-list.component';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { WebinfoComponent } from './webinfo/webinfo.component';
import { ContactMessagesComponent } from './contact-messages/contact-messages.component';
import { ConfirmDialogComponent, FaqComponent } from './faq/faq.component';




@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(UiComponentsRoutes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule.pick(TablerIcons),
    MatNativeDateModule,
    MatChipsModule
  ],
  declarations: [
    AppBadgeComponent,
    AppChipsComponent,
    AppListsComponent,
    AppMenuComponent,
    AppTooltipsComponent,
    AddProductComponent,
    ProductListComponent,
    ProductDetailsComponent,
    UpdateProductComponent,
    OrdersListComponent,
    ManageCarrouselComponent,
    NewsLetterComponent,
    EmailComposerDialogComponent,
    NoteListComponent,
    CategoryListComponent,
    WebinfoComponent,
    ContactMessagesComponent,
    FaqComponent,
    ConfirmDialogComponent
  ],
})
export class UicomponentsModule {}
