import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { StoreService } from 'src/app/core/services/store.service';
import { appRoutes } from 'src/app/shared/constants/app-routes-constant';
import { Model } from 'src/app/shared/models/model';

@Component({
  selector: 'app-model-list',
  templateUrl: './model-list.component.html',
  styleUrls: ['./model-list.component.scss'],
})
export class ModelListComponent implements OnInit {
  public models$!: Observable<Model[]>;
  public selectedModel$ = new BehaviorSubject<Model | null>(null);

  constructor(private router: Router, private store: StoreService) {}

  public handleModelClick(model: Model): void {
    this.selectedModel$.next(model);
  }

  public ngOnInit(): void {
    this.models$ = this.store.getModels$();
  }

  public handleUploadModelClick(): void {
    this.router.navigate(['/', appRoutes.model, appRoutes.modelUpload]);
  }

  public handleEditModelClick(): void {
    if (this.selectedModel$.value)
      this.router.navigate([
        '/',
        appRoutes.model,
        this.selectedModel$.value?.id,
      ]);
  }
}
