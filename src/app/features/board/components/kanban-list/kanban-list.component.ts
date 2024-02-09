import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop'
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component'
import { FormBuilder, FormControl } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { ModalService } from '../../../../shared/services/modal.service'
import { EditTaskModalComponent } from '../../../../shared/components/edit-task/edit-task-modal.component'
import { List, Task } from '../../../../shared'

@Component({
    selector: 'app-kanban-list',
    standalone: true,
    imports: [
        CommonModule,
        KanbanTaskComponent,
        EditTaskModalComponent,
        CdkDropList
    ],
    template: `
        <div
            cdkDropList
            (cdkDropListDropped)="taskPositionChange($event)"
            [id]="list.position.toString()"
            class="list"
        >
            <h2 class="list_name">{{ list.name }}</h2>
            @for (task of list.tasks; track task) {
                <app-kanban-task (click)="taskClick(task)" [task]="task"></app-kanban-task>
            }

            <ng-container *ngIf="!showForm; else dialog">
                <button (click)="showForm = !showForm">Add new</button>
            </ng-container>
        </div>

        <ng-template #dialog>
            <div>
                <label for="task_name">Task Name:</label>
                <input
                    type="text"
                    id="task_name"
                    name="task_name"
                    formControl="form"
                    #input
                />
                <input
                    type="submit"
                    value="add"
                    (click)="taskAdd(input.value)"
                />
            </div>
        </ng-template>
    `,
    styles: ``,
})
export class KanbanListComponent {
    constructor(private modal: ModalService) {}

    @Input() list!: List & { tasks: Task[] }

    @Output() onTaskPositionChange: EventEmitter<CdkDragDrop<Task[]>> =
        new EventEmitter()

    @Output() onTaskAdd: EventEmitter<string> = new EventEmitter()
    @Output() onTaskChange: EventEmitter<{ id: string, title: string, description: string }> = new EventEmitter()

    form = new FormControl('')
    showForm = false

    taskPositionChange(event: any) {
        this.onTaskPositionChange.emit(event as CdkDragDrop<Task[]>)
    }

    taskAdd(value: string) {
        this.onTaskAdd.emit(value);
    }

    taskClick(data: Task) {
        const ref = this.modal.open(EditTaskModalComponent, { data })

        ref.afterClosed().subscribe((data) => {
            if(data) {
                this.onTaskChange.emit(data);
            }
        })
    }
}
