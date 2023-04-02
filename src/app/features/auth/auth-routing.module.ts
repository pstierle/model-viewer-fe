import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appRoutes } from 'src/app/shared/constants/app-routes-constant';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: appRoutes.login,
    pathMatch: 'full',
  },
  {
    component: LoginComponent,
    path: appRoutes.login,
  },
  {
    component: RegisterComponent,
    path: appRoutes.register,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
