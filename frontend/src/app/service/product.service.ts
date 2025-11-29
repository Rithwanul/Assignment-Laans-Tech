// src/app/service/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

import { Product } from '../models/product/product';
import { ProductMetadata } from '../models/product/product-metadata';
import { ProductPage } from '../models/product/product-page';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  private pageIndexSubject = new BehaviorSubject<number>(0); // 0-based
  private pageSizeSubject = new BehaviorSubject<number>(10);
  private totalElementsSubject = new BehaviorSubject<number>(0);

  products$ = this.productsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  pageIndex$ = this.pageIndexSubject.asObservable();
  pageSize$ = this.pageSizeSubject.asObservable();
  totalElements$ = this.totalElementsSubject.asObservable();

  private apiUrl = 'http://localhost:8080/api/products';

  get backendBaseUrl(): string {
    const url = new URL(this.apiUrl);
    // pathname: "/api/products" → drop the trailing "/products"
    const contextPath = url.pathname.replace(/\/products$/, ''); // "/api"
    return `${url.origin}${contextPath}`; // "http://localhost:8080/api"
  }

  pageCount$: Observable<number> = this.totalElements$.pipe(
    map((total) => {
      const size = this.pageSizeSubject.value || 1;
      return Math.max(Math.ceil(total / size), 1);
    })
  );

  constructor(private http: HttpClient) {}

  loadProducts(pageIndex: number = this.pageIndexSubject.value): void {
    const size = this.pageSizeSubject.value;

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const params = new HttpParams().set('page', pageIndex.toString()).set('size', size.toString());

    this.http
      .get<ProductPage>(this.apiUrl, { params })
      .pipe(
        tap((page) => {
          if (!page) return;

          this.productsSubject.next(page.content);
          this.pageIndexSubject.next(page.page);
          this.pageSizeSubject.next(page.size);
          this.totalElementsSubject.next(page.totalElements);

          this.loadingSubject.next(false);
        }),
        catchError((err) => {
          console.error('Error loading products', err);
          this.errorSubject.next('Failed to load products.');
          this.loadingSubject.next(false);
          return of(null);
        })
      )
      .subscribe();
  }

  changePage(direction: 'prev' | 'next'): void {
    const currentIndex = this.pageIndexSubject.value;
    const pageCount = Math.max(
      Math.ceil(this.totalElementsSubject.value / (this.pageSizeSubject.value || 1)),
      1
    );

    let newIndex = currentIndex;
    if (direction === 'prev') {
      newIndex = Math.max(currentIndex - 1, 0);
    } else {
      newIndex = Math.min(currentIndex + 1, pageCount - 1);
    }

    if (newIndex !== currentIndex) {
      this.loadProducts(newIndex);
    }
  }

  addProduct(metadata: ProductMetadata, image?: File): Observable<Product[]> {
    const formData = new FormData();

    if (image) {
      formData.append('images', image);
    }

    formData.append('metadata', JSON.stringify([metadata]));

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<Product[] | Product>(`${this.apiUrl}/bulk-upload`, formData).pipe(
      map((response): Product[] => (Array.isArray(response) ? response : [response])),
      tap(() => {
        this.loadProducts();
        this.loadingSubject.next(false);
      }),
      catchError((err): Observable<Product[]> => {
        console.error('Error adding product', err);
        this.errorSubject.next('Failed to add product.');
        this.loadingSubject.next(false);
        return of([] as Product[]);
      })
    );
  }

  bulkUpload(metadataList: ProductMetadata[], images: File[]): Observable<Product[]> {
    const formData = new FormData();

    images.forEach((file) => formData.append('images', file));
    formData.append('metadata', JSON.stringify(metadataList));

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<Product[] | Product>(`${this.apiUrl}/bulk-upload`, formData).pipe(
      map((response): Product[] => (Array.isArray(response) ? response : [response])),
      tap(() => {
        this.loadProducts();
        this.loadingSubject.next(false);
      }),
      catchError((err): Observable<Product[]> => {
        console.error('Error bulk uploading products', err);
        this.errorSubject.next('Failed to upload products.');
        this.loadingSubject.next(false);
        return of([] as Product[]);
      })
    );
  }
}
