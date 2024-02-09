import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core'
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    constructor(private dialog: MatDialog) {}

    current_ref!: MatDialogRef<any>;

    open<T>(component: ComponentType<T>, config: MatDialogConfig<any>): MatDialogRef<T> {
        this.current_ref = this.dialog.open(component, config);
        return this.current_ref;
    }

    close() {
        this.current_ref.close();
    }
}
