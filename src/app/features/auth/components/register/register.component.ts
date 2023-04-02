import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoreService } from 'src/app/core/services/store.service';
import { appRoutes } from 'src/app/shared/constants/app-routes-constant';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public appRoutes = appRoutes;

  public registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(10),
    ]),
  });

  constructor(private store: StoreService) {}

  public async onRegisterSubmit(): Promise<void> {
    const name = this.registerForm.getRawValue().name;
    if (name) {
      await this.store.login(name);
    }
  }
}
