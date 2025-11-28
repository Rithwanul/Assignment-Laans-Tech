import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEvent, HttpEventType } from '@angular/common/http';

import { ProductService } from '../service/product.service';
import { Product, ProductMetadata, ProductPage } from '../models/product';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-product-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-upload.component.html',
  styleUrl: './product-upload.component.scss',
})
export class ProductUploadComponent implements OnInit {
  selectedFiles: File[] = [];
  metadataList: ProductMetadata[] = [];

  uploadInProgress = false;
  uploadProgress = 0;

  productsPage?: ProductPage;
  currentPage = 0;
  pageSize = 10;

  imageBaseUrl = environment.imageBaseUrl;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files: File[] = Array.from(input.files);
    this.selectedFiles = files;
    this.metadataList = files.map((f: File) => ({
      name: f.name,
      description: '',
      price: 0,
      sku: f.name,
    }));
  }

  trackByIndex(index: number): number {
    return index;
  }

  upload(): void {
    if (!this.selectedFiles.length) return;

    this.uploadInProgress = true;
    this.uploadProgress = 0;

    this.productService.bulkUpload(this.selectedFiles, this.metadataList).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadProgress = 100;
          this.uploadInProgress = false;
          this.selectedFiles = [];
          this.metadataList = [];
          this.loadPage(0);
        }
      },
      error: (err: any) => {
        console.error('Upload failed', err);
        this.uploadInProgress = false;
      },
    });
  }

  loadPage(page: number): void {
    if (page < 0) return;

    this.productService.getProducts(page, this.pageSize).subscribe({
      next: (pageData: ProductPage) => {
        this.productsPage = pageData;
        this.currentPage = pageData.page;
      },
      error: (err: any) => console.error('Failed to load products', err),
    });
  }

  totalPages(): number {
    if (!this.productsPage) return 0;
    return Math.ceil(this.productsPage.totalElements / this.productsPage.size);
  }

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  imageHref(product: Product): string {
    return `${this.imageBaseUrl}${product.imageUrl}`;
  }
}
