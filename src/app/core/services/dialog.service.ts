import { ComponentType } from '@angular/cdk/portal';
import { Injectable, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  public openDialog<T, D>(
    component: ComponentType<T> | TemplateRef<T>,
    event: MouseEvent,
    data: D
  ): MatDialogRef<T> {
    const dialog = this.dialog.open(component, {
      data,
    });
    dialog.updatePosition({
      top: `${event.clientY + 30}px`,
      left: `${event.clientX + 30}px`,
    });
    return dialog;
  }
}
