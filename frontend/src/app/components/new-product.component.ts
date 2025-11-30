import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { ProductService } from '../../app/service/product.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UploadFinishedDialogComponent } from './upload-finished-dialog.component';

@Component({
  selector: 'app-new-product',
  standalone: true, // important for loadComponent()
  templateUrl: './../html/new-product.component.html',
  styleUrls: ['./../scss/new-product.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    UploadFinishedDialogComponent,
  ],
})
export class NewProductComponent {
  form: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  uploadProgress = 0;
  isSubmitting = false;
  uploadError: string | null = null;

  // alert state
  showAlert = false;
  alertTitle = '';
  alertMessage = '';
  uploadComplete = false;
  showDialog: boolean = false;

  constructor(
    private fb: FormBuilder,
    public productService: ProductService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      description: [''],
    });
  }

  get f() {
    return this.form.controls;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    // For multiple selection in one go
    // (if you want to ADD to previous files instead, see comment below)
    this.selectedFiles = Array.from(input.files);

    // reset previews
    this.previewUrls = [];

    console.log('Selected files:', this.selectedFiles.length);

    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (!result) return;

        // IMPORTANT: use immutable update so Angular sees each change
        this.previewUrls = [...this.previewUrls, result as string];
      };

      reader.readAsDataURL(file);
    });

    this.uploadError = null;
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  // onSubmit(): void {
  //   if (this.form.invalid || this.selectedFiles.length === 0) {
  //     this.form.markAllAsTouched();
  //     this.uploadError = 'Please select at least one product image.';
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   this.uploadProgress = 0;

  //   const formData = new FormData();

  //   // ======================
  //   // MULTIPLE IMAGE METADATA
  //   // ======================
  //   const metadataArray = this.selectedFiles.map((file, index) => ({
  //     name: `${this.form.value.name} #${index + 1}`,
  //     description: this.form.value.description || '',
  //     price: this.form.value.price,
  //     sku: `${this.form.value.sku}-${index + 1}`,
  //   }));

  //   formData.append('metadata', JSON.stringify(metadataArray));

  //   // ======================
  //   // IMAGES (multiple)
  //   // ======================
  //   this.selectedFiles.forEach((file) => {
  //     formData.append('images', file);
  //   });

  //   // ======================
  //   // API CALL
  //   // ======================
  //   this.productService.bulkUploadProducts(formData).subscribe({
  //     next: (event) => {
  //       if (event.type === HttpEventType.UploadProgress && event.total) {
  //         this.uploadProgress = Math.round((100 * event.loaded) / event.total);
  //       } else if (event.type === HttpEventType.Response) {
  //         // this.showDialog = true;
  //         // this.router.navigate(['/']);
  //         this.dialog.open(UploadFinishedDialogComponent, {
  //           panelClass: 'custom-dialog-panel', // optional class for outer container
  //         });
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this.uploadError = 'Upload failed. Try again. Error: ' + err;
  //     },
  //   });
  // }

  onSubmit(): void {
    if (this.form.invalid || this.selectedFiles.length === 0) {
      this.form.markAllAsTouched();
      this.uploadError = 'Please select at least one product image.';
      return;
    }

    this.isSubmitting = true;
    this.uploadProgress = 0;

    const formData = new FormData();

    // Build metadata array, one object per image
    const metadataArray = this.selectedFiles.map((file, index) => ({
      name: `${this.form.value.name} #${index + 1}`,
      description: this.form.value.description || '',
      price: this.form.value.price,
      sku: `${this.form.value.sku}-${index + 1}`,
    }));

    // This should match your curl's "metadata" field
    formData.append('metadata', JSON.stringify(metadataArray));

    // This should match your curl's "images" fields
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.productService.bulkUploadProducts(formData).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          const dialogRef = this.dialog.open(UploadFinishedDialogComponent, {
            panelClass: 'custom-dialog-panel',
          });

          dialogRef.afterClosed().subscribe(() => {
            // clear form & state here
            this.form.reset({
              name: '',
              sku: '',
              price: 0,
              description: '',
            });
            this.form.markAsPristine();
            this.form.markAsUntouched();

            this.selectedFiles = [];
            this.previewUrls = [];
            this.uploadProgress = 0;
            this.isSubmitting = false;
            this.uploadError = null;

            this.router.navigate(['/product-list']);
          });
        }
      },
      error: (err) => {
        console.error('Upload error', err);

        // HttpErrorResponse has no getMessage()
        const backendMessage = (err.error && (err.error.message || err.error.error)) || '';

        this.uploadError =
          'Upload failed. Try again. ' +
          (backendMessage || `Status: ${err.status} ${err.statusText}`);

        this.isSubmitting = false;
      },
    });
  }

  onCloseAlert() {
    // hide alert
    this.showAlert = false;

    // reset upload state
    this.uploadComplete = false;
    this.uploadProgress = 0;
    this.isSubmitting = false;
    this.uploadError = null;

    // clear files & previews
    this.selectedFiles = [];
    this.previewUrls = [];

    // reset form fields
    this.form.reset({
      name: '',
      sku: '',
      price: 0,
      description: '',
    });

    // optional: make form look untouched
    this.form.markAsPristine();
    this.form.markAsUntouched();

    // OPTIONAL: if you also want to go back to product list:
    // this.router.navigate(['/product-list']);
  }

  closeDialog() {
    this.showDialog = false;
    this.router.navigate(['/product-list']);
  }

  onCancel(): void {
    this.router.navigate(['/']); // back to product list (root route)
  }

  /* onCloseAlert(): void {
    this.showAlert = false;
    if (this.uploadComplete) {
      // go back to product list after successful upload
      this.router.navigate(['/']);
    }
  } */
}
