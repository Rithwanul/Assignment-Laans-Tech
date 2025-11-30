import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-finished-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './../html/upload-finished-dialog.component.html',
  styleUrls: ['./../scss/upload-finished-dialog.component.scss'],
})
export class UploadFinishedDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<UploadFinishedDialogComponent>,
    private router: Router
  ) {}

  // Called from template button
  closeDialog() {
    // close the Material dialog
    this.dialogRef.close();

    // navigate after closing (if you want)
    this.router.navigate(['/product-list']);
  }
}
