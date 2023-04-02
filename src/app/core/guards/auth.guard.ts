import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { appRoutes } from 'src/app/shared/constants/app-routes-constant';
import { StoreService } from '../services/store.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private store: StoreService, private router: Router) {}

  public async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const isLoggedIn = !!this.store.currentUser$.value;
    if (!isLoggedIn) {
      const localName = localStorage.getItem('name');
      if (localName) {
        try {
          await this.store.login(localName);
          return true;
        } catch (e) {
          this.router.navigate(['/', appRoutes.auth]);
          return false;
        }
      } else {
        this.router.navigate(['/', appRoutes.auth]);
        return false;
      }
    }
    return true;
  }
}
