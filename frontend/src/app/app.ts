import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductUploadComponent } from './product-upload/product-upload.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProductUploadComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  title = 'frontend';
}
