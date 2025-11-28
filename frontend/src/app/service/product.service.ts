import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductMetadata, ProductPage } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {}

  bulkUpload(images: File[], metadata: ProductMetadata[]): Observable<HttpEvent<Product[]>> {
    const formData = new FormData();

    images.forEach((file: File) => formData.append('images', file));
    formData.append('metadata', JSON.stringify(metadata));

    const req = new HttpRequest('POST', `${this.baseUrl}/bulk-upload`, formData, {
      reportProgress: true,
    });

    return this.http.request<Product[]>(req);
  }

  getProducts(page: number, size: number): Observable<ProductPage> {
    return this.http.get<ProductPage>(`${this.baseUrl}?page=${page}&size=${size}`);
  }
}
