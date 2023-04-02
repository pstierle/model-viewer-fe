import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { PointOfInterest } from 'src/app/shared/models/point-of-interest';

@Component({
  selector: 'app-point-of-interest-dialog',
  templateUrl: './point-of-interest-dialog.component.html',
  styleUrls: ['./point-of-interest-dialog.component.scss'],
})
export class PointOfInterestDialogComponent {
  private id!: string;

  public pointOfInterestForm = new FormGroup({
    name: new FormControl('', []),
    description: new FormControl('', []),
  });

  constructor(
    public dialogRef: MatDialogRef<PointOfInterestDialogComponent>,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) data: PointOfInterest
  ) {
    this.id = data.id;
    this.pointOfInterestForm.get('name')?.patchValue(data.name);
    this.pointOfInterestForm.get('description')?.patchValue(data.description);
  }

  public async onSubmit(): Promise<void> {
    const name = this.pointOfInterestForm.getRawValue().name;
    const description = this.pointOfInterestForm.getRawValue().description;
    await this.apiService.updatePointOfInterests(this.id, name, description);
    this.dialogRef.close({
      name,
      description,
    });
  }
}
