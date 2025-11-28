export interface ProductMetadata {
  name: string;
  description: string;
  price: number;
  sku: string;
}

export interface Product {
  id: string;
  metadata: ProductMetadata;
  imageFileName: string;
  imageUrl: string;
  createdAt: string;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  page: number;
  size: number;
}
