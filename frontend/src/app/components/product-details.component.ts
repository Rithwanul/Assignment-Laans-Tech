import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../service/product.service';
import { Product } from '../models/product/product';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './../html/product-details.component.html',
  styleUrls: ['./../scss/product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit {
  product!: Product | null;
  loading = true;
  id!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public productService: ProductService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') as string;

    this.productService.products$.subscribe((products) => {
      this.product = products.find((p) => p.id === this.id) || null;
      this.loading = false;
    });
  }

  back(): void {
    // this.router.navigate(['']);
    window.history.back();
  }
}
