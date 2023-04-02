import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private snackbar: MatSnackBar) {}

  public handleError(response: any) {
    if (response?.rejection?.error?.message) {
      this.snackbar.open(response.rejection.error.message, '', {
        duration: 4000,
      });
    }
  }
}
