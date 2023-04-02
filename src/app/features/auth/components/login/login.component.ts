import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoreService } from 'src/app/core/services/store.service';
import { appRoutes } from 'src/app/shared/constants/app-routes-constant';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public appRoutes = appRoutes;

  public loginForm = new FormGroup({
    name: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(10),
    ]),
  });

  constructor(private store: StoreService) {}

  public async onLoginSubmit(): Promise<void> {
    const name = this.loginForm.getRawValue().name;
    if (name) {
      await this.store.login(name);
    }
  }
}
