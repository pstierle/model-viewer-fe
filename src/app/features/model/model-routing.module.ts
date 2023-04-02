import { ModelUploadComponent } from './components/model-upload/model-upload.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appRoutes } from 'src/app/shared/constants/app-routes-constant';
import { ModelListComponent } from './components/model-list/model-list.component';
import { ModelComponent } from './components/model/model.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: appRoutes.modelList,
    pathMatch: 'full',
  },
  {
    component: ModelListComponent,
    path: appRoutes.modelList,
  },
  {
    component: ModelUploadComponent,
    path: appRoutes.modelUpload,
  },
  {
    component: ModelComponent,
    path: ':id',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelRoutingModule {}
