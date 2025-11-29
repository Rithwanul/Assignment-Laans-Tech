import { Product } from "./product";

export interface ProductPage {
  content: Product[];
  totalElements: number;
  page: number;
  size: number;
}
