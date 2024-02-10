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
            [id]="index.toString()"
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
            <div class="dialog">
            <input
            type="text"
            id="task_name"
            name="task_name"
            formControl="form"
            placeholder="Enter a title for this task"
                #input
            />
            <div class="buttons"> 
                <button (click)="taskAdd(input.value)">add</button>
                <button (click)="taskAddCancel()">cancel</button>
            </div>
            </div>
        </ng-template>
    `,
    styleUrl: './kanban-list.component.scss'
})
export class KanbanListComponent {
    constructor(private modal: ModalService) {}

    @Input() list!: List & { tasks: Task[] }
    @Input() index!: number

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
        this.showForm = false;
        this.form.reset();
    }

    taskAddCancel() {
        this.showForm = false;
        this.form.reset();
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
