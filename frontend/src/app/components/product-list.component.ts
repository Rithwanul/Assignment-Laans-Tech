import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';

import { Product } from '../models/product/product';
import { ProductService } from '../service/product.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: '../html/product-list.component.html',
  styleUrls: ['../scss/product-list.component.scss'],
  imports: [CommonModule, CurrencyPipe, RouterModule],
})
export class ProductListComponent implements OnInit {
  products$!: Observable<Product[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  pageIndex$!: Observable<number>;
  pageSize$!: Observable<number>;
  totalElements$!: Observable<number>;
  pageCount$!: Observable<number>;

  constructor(public productService: ProductService, private router: Router) {}

  getImageUrl(product: Product): string {
    const url = product.imageUrl || '';

    // if backend ever returns full URLs, don't double-prefix
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return this.productService.backendBaseUrl + url;
  }

  cardClicked(product: any): void {
    console.log('Card clicked:', product.id, product);
  }

  openProduct(id: string): void {
    console.log('Id : ' + id);
    this.router.navigate(['/products', id]);
  }

  ngOnInit(): void {
    this.products$ = this.productService.products$;
    this.loading$ = this.productService.loading$;
    this.error$ = this.productService.error$;
    this.pageIndex$ = this.productService.pageIndex$;
    this.pageSize$ = this.productService.pageSize$;
    this.totalElements$ = this.productService.totalElements$;
    this.pageCount$ = this.productService.pageCount$;

    this.productService.loadProducts();
  }

  onPageChange(direction: 'prev' | 'next'): void {
    this.productService.changePage(direction);
  }

  onNewProduct(): void {
    console.log('new product clicked');
      this.router.navigate(['/products/new']);
  }
}
