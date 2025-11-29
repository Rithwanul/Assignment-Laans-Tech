import { Routes } from '@angular/router';

export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'products',
  //   pathMatch: 'full',
  // },

  {
    path: '',
    loadComponent: () =>
      import('./components/product-list.component').then((m) => m.ProductListComponent),
  },

  {
    path: 'products/:id',
    loadComponent: () =>
      import('./components/product-details.component').then((m) => m.ProductDetailsComponent),
  },

  // optional fallback
  {
    path: '**',
    redirectTo: 'products',
  },
];
