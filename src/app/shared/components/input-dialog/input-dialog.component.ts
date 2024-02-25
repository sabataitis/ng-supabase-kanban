import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'

@Component({
    selector: 'app-input-dialog',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
        <input type="text" [placeholder]="placeholder" [formControl]="fc" #ref />
        <div class="button-group">
            <button (click)="onSubmit(ref.value)">submit</button>
            <button (click)="onCancel()">cancel</button>
        </div>
    `,
    styles: ``,
})
export class InputDialogComponent {
    fc = new FormControl()

    @Input() placeholder = 'enter title: ';

    @Output() submit = new EventEmitter<string>()
    @Output() cancel = new EventEmitter<void>()

    onSubmit(value: string) {
        this.submit.emit(value);
        this.fc.reset();
    }

    onCancel() {
        this.cancel.emit();
        this.fc.reset();
    }
}
