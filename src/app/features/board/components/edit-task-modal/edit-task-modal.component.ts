import {
    Component,
    ElementRef,
    EventEmitter,
    Output,
    ViewChild,
} from '@angular/core'

import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { BehaviorSubject } from 'rxjs'
import { Task } from '../../../../shared'

@Component({
    selector: 'app-edit-task-modal',
    templateUrl: './edit-task-modal.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule],
})
export class EditTaskModalComponent {
    @ViewChild('modal') modalRef!: ElementRef

    @Output() taskChange = new EventEmitter<Task>()

    taskSnapshot$ = new BehaviorSubject<Task | null>(null)

    form = new FormGroup({
        title: new FormControl('', Validators.required),
        description: new FormControl(''),
    })

    openModal(task: Task) {
        this.taskSnapshot$.next(task)

        this.modalRef.nativeElement.setAttribute('open', 'true')

        this.form.patchValue({
            title: task.title,
            description: task.description,
        })
    }

    protected handleClickOverlay(event: any) {
        if (event.target === event.currentTarget) {
            this.closeModal()
        }
    }

    protected onSubmit() {
        // TODO: add message
        if (this.form.invalid) return

        const formValue = this.form.value as any as Task

        const snapshot = this.taskSnapshot$.value as any as Task
        const hasChanged = snapshot.title !== formValue.title || snapshot.description !== formValue.description;

        if (hasChanged) {
            this.closeModal()

            this.taskChange.emit({
                ...snapshot,
                ...formValue,
            })
        }
    }

    protected closeModal() {
        this.modalRef.nativeElement.setAttribute('open', 'false')
        this.form.reset()
    }
}
