import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop'
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component'
import { FormControl } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { ModalService } from '../../../../shared/services/modal.service'
import { EditTaskModalComponent } from '../../../../shared/components/edit-task/edit-task-modal.component'
import { List, Task } from '../../../../shared'
import { InputDialogComponent } from '../../../../shared/components/input-dialog/input-dialog.component'

@Component({
    selector: 'app-kanban-list',
    standalone: true,
    imports: [
        CommonModule,
        KanbanTaskComponent,
        EditTaskModalComponent,
        CdkDropList,
        InputDialogComponent,
    ],
    template: `
        <div
            cdkDropList
            (cdkDropListDropped)="taskPositionChange($event)"
            [id]="index.toString()"
            class="list"
        >
            <h2 class="name">{{ list.name }}</h2>
            @for (task of list.tasks; track task) {
                <app-kanban-task
                    (click)="taskClick(task)"
                    [task]="task"
                ></app-kanban-task>
            }

            <button *ngIf="!showForm" (click)="showForm = !showForm">
                Add new
            </button>
            <app-input-dialog
                *ngIf="showForm"
                (submit)="taskAdd($event)"
                (cancel)="taskAddCancel()"
            >
            </app-input-dialog>
        </div>
    `,
})
export class KanbanListComponent {
    constructor(private modal: ModalService) {}

    @Input() list!: List & { tasks: Task[] }
    @Input() index!: number

    @Output() onTaskPositionChange: EventEmitter<CdkDragDrop<Task[]>> =
        new EventEmitter()

    @Output() onTaskAdd: EventEmitter<string> = new EventEmitter()
    @Output() onTaskChange: EventEmitter<{
        id: string
        title: string
        description: string
    }> = new EventEmitter()

    form = new FormControl('')
    showForm = false

    taskPositionChange(event: any) {
        this.onTaskPositionChange.emit(event as CdkDragDrop<Task[]>)
    }

    taskAdd(value: string) {
        this.onTaskAdd.emit(value)
        this.showForm = false
    }

    taskAddCancel() {
        this.showForm = false
    }

    taskClick(data: Task) {
        const ref = this.modal.open(EditTaskModalComponent, { data })

        ref.afterClosed().subscribe((data) => {
            if (data) {
                this.onTaskChange.emit(data)
            }
        })
    }
}
