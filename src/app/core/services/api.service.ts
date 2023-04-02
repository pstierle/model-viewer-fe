import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Model } from '../../shared/models/model';
import { User } from '../../shared/models/user';
import { PointOfInterest } from '../../shared/models/point-of-interest';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseApiUrl = 'http://localhost:3000';
  //private readonly baseApiUrl = 'http://192.168.178.26:3000';

  constructor(private http: HttpClient) {}

  public getModels$(userId: string): Observable<Model[]> {
    return this.http.get<Model[]>(`${this.baseApiUrl}/model/all/${userId}`);
  }

  public getModel(id: string): Promise<Model | undefined> {
    return this.http.get<Model>(`${this.baseApiUrl}/model/${id}`).toPromise();
  }

  public async getPointOfInterests(
    modelId: string
  ): Promise<PointOfInterest[]> {
    const data = await this.http
      .get<PointOfInterest[]>(`${this.baseApiUrl}/point-of-interest/${modelId}`)
      .toPromise();

    return data ?? [];
  }

  public createPointOfInterests(
    x: number,
    y: number,
    z: number,
    modelId: string
  ): Promise<PointOfInterest | undefined> {
    return this.http
      .post<PointOfInterest | undefined>(
        `${this.baseApiUrl}/point-of-interest`,
        {
          x,
          y,
          z,
          modelId,
        }
      )
      .toPromise();
  }

  public updatePointOfInterests(
    id: string,
    name?: string | null,
    description?: string | null
  ): Promise<PointOfInterest | undefined> {
    return this.http
      .put<PointOfInterest | undefined>(
        `${this.baseApiUrl}/point-of-interest`,
        {
          id,
          name,
          description,
        }
      )
      .toPromise();
  }

  public async login(name: string): Promise<User | null | undefined> {
    return this.http
      .get<User | null | undefined>(`${this.baseApiUrl}/auth/login/${name}`)
      .toPromise();
  }

  public async register(name: string): Promise<User | null | undefined> {
    return this.http
      .post<User | null | undefined>(`${this.baseApiUrl}/auth/register`, {
        name,
      })
      .toPromise();
  }

  public async createModel(
    modelName: string,
    userId: string
  ): Promise<Model | undefined> {
    const model = await this.http
      .post<Model | undefined>(`${this.baseApiUrl}/model`, {
        modelName,
        userId,
      })
      .toPromise();

    return model;
  }

  public async uploadModelFile(formData: FormData): Promise<void> {
    await this.http
      .post<User | null | undefined>(
        `${this.baseApiUrl}/model/upload`,
        formData
      )
      .toPromise();
  }
}
