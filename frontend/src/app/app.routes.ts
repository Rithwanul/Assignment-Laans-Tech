import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./components/new-product.component').then((m) => m.NewProductComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./components/product-details.component').then((m) => m.ProductDetailsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
