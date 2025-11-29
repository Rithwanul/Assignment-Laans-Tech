import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';

import { Product } from '../models/product/product';
import { ProductService } from '../service/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: '../html/product-list.component.html',
  styleUrls: ['../scss/product-list.component.scss'],
  imports: [CommonModule, CurrencyPipe],
})
export class ProductListComponent implements OnInit {
  products$!: Observable<Product[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  pageIndex$!: Observable<number>;
  pageSize$!: Observable<number>;
  totalElements$!: Observable<number>;
  pageCount$!: Observable<number>;

  constructor(private productService: ProductService) {}

  getImageUrl(product: Product): string {
    const url = product.imageUrl || '';

    // if backend ever returns full URLs, don't double-prefix
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return this.productService.backendBaseUrl + url;
  }

  ngOnInit(): void {
    this.products$ = this.productService.products$;
    this.loading$ = this.productService.loading$;
    this.error$ = this.productService.error$;
    this.pageIndex$ = this.productService.pageIndex$;
    this.pageSize$ = this.productService.pageSize$;
    this.totalElements$ = this.productService.totalElements$;
    this.pageCount$ = this.productService.pageCount$;

    this.productService.loadProducts(0);
  }

  onPageChange(direction: 'prev' | 'next'): void {
    this.productService.changePage(direction);
  }

  onNewProduct(): void {
    console.log('new product clicked');
  }
}
