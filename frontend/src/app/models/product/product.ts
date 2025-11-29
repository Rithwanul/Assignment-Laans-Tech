import { ProductMetadata } from './product-metadata';

export interface Product {
  id: string;
  metadata: ProductMetadata;
  imageFileName: string;
  imageUrl: string;
  createdAt: string;
}
