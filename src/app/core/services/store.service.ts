import { mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { appRoutes } from 'src/app/shared/constants/app-routes-constant';
import { User } from 'src/app/shared/models/user';
import { ApiService } from 'src/app/core/services/api.service';
import { Model } from 'src/app/shared/models/model';
import { PointOfInterest } from 'src/app/shared/models/point-of-interest';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  public currentUser$ = new BehaviorSubject<User | null | undefined>(null);
  public models$ = new BehaviorSubject<Model[]>([]);

  constructor(
    private apiService: ApiService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  public async login(name: string): Promise<void> {
    const user = await this.apiService.login(name);
    this.currentUser$.next(user);
    if (!!user) {
      await this.router.navigate(['/', appRoutes.model]);
      this.snackbar.open('Sucessfully logged in.', '', {
        duration: 4000,
      });
      localStorage.setItem('name', name);
    }
  }

  public async register(name: string): Promise<void> {
    await this.apiService.register(name);
    await this.router.navigate(['/', appRoutes.auth, appRoutes.login]);
    this.snackbar.open('Sucessfully registered.', '', {
      duration: 4000,
    });
  }

  public getModels$(): Observable<Model[]> {
    if (this.currentUser$?.value?.id) {
      return this.apiService.getModels$(this.currentUser$?.value?.id);
    } else {
      return of([]);
    }
  }

  public getModel(id: string): Promise<Model | undefined> {
    return this.apiService.getModel(id);
  }

  public getPointOfInterests(modelId: string): Promise<PointOfInterest[]> {
    return this.apiService.getPointOfInterests(modelId);
  }

  public async createModel(modelName: string, file: File): Promise<void> {
    try {
      if (this.currentUser$?.value?.id) {
        const model = await this.apiService.createModel(
          modelName,
          this.currentUser$.value.id
        );
        if (model) {
          const data = new FormData();
          data.append(
            'file',
            file,
            `${this.currentUser$.value.id}-${model.id}.glb`
          );

          await this.apiService.uploadModelFile(data);
        }
      }
    } catch (e) {}
  }
}
