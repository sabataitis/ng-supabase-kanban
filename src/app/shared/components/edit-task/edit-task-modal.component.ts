import { Component, Inject } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { Task } from '../../types'

@Component({
    selector: 'app-edit-task-modal',
    templateUrl: './edit-task-modal.component.html',
    standalone: true,
    styleUrl: './edit-task-modal.component.scss',
    imports: [ReactiveFormsModule, FormsModule],
})
export class EditTaskModalComponent {
    constructor(
        public dialogRef: MatDialogRef<EditTaskModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Task
    ) {
        this.form.patchValue(data)
    }

    closeModal(): void {
        this.dialogRef.close()
    }

    form = new FormGroup({
        title: new FormControl('', Validators.required),
        description: new FormControl(''),
    })

    onSubmit() {
        if (this.form.invalid) return

        const value = this.form.value

        this.dialogRef.close({
            ...this.data,
            ...value,
        })
    }
}
