import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const materialModules = [
  MatSlideToggleModule,
  MatSliderModule,
  MatFormFieldModule,
  MatButtonModule,
  MatInputModule,
  MatCardModule,
  MatTabsModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatProgressBarModule,
  MatDialogModule,
];

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...materialModules],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, ...materialModules],
  providers: [],
})
export class SharedModule {}
