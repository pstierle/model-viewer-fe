import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelRoutingModule } from './model-routing.module';
import { ModelListComponent } from './components/model-list/model-list.component';
import { ModelComponent } from './components/model/model.component';
import { ModelUploadComponent } from './components/model-upload/model-upload.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PointOfInterestDialogComponent } from './components/point-of-interest-dialog/point-of-interest-dialog.component';

@NgModule({
  declarations: [
    ModelListComponent,
    ModelComponent,
    ModelUploadComponent,
    PointOfInterestDialogComponent,
  ],
  imports: [CommonModule, ModelRoutingModule, SharedModule],
})
export class ModelModule {}
