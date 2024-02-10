import { CommonModule } from '@angular/common'
import { Component, Input, OnDestroy, OnInit } from '@angular/core'

import {
    CdkDrag,
    CdkDragDrop,
    CdkDropList,
    CdkDropListGroup,
} from '@angular/cdk/drag-drop'

import { Subject, takeUntil } from 'rxjs'

import { FormControl, ReactiveFormsModule } from '@angular/forms'
import {
    CreateTaskPayload,
    TaskService,
    UpdateTaskPayload,
    UpdateTaskPosPayload,
} from './services/task.service'
import { KanbanTaskComponent } from './components/kanban-task/kanban-task.component'
import { KanbanListComponent } from './components/kanban-list/kanban-list.component'
import { List, Task } from '../../shared'
import { AuthService } from '../../core/services/auth.service'

@Component({
    selector: 'app-board',
    standalone: true,
    providers: [TaskService],
    imports: [
        CommonModule,
        CdkDropListGroup,
        CdkDropList,
        CdkDrag,
        KanbanTaskComponent,
        ReactiveFormsModule,
        KanbanListComponent,
    ],
    template: `
        <div class="board" cdkDropListGroup>
            <ng-container *ngIf="state$ | async as state">
                <ng-container *ngIf="state.lists as lists">
                    @for (list of lists; track list; let i = $index) {
                        <app-kanban-list
                            [list]="list"
                            [index]="i"
                            (onTaskPositionChange)="
                                taskPositionChange({ event: $event, lists })
                            "
                            (onTaskAdd)="addTask($event, list)"
                            (onTaskChange)="updateTask($event)"
                        ></app-kanban-list>
                    }
                </ng-container>

                <ng-container *ngIf="!toggleListDialog; else dialog">
                    <div class="toggle-list-block"> 
                    <button (click)="toggleListDialog = !toggleListDialog">
                        Add new list
                    </button>
                </div>
                </ng-container>
            </ng-container>
        </div>

        <ng-template #dialog>
                <div class="dialog">
                    <input
                        type="text"
                        id="list_name"
                        name="list_name"
                        placeholder="Enter a title for this list"
                        [formControl]="newListForm"
                        #listInput
                    />
                    <div class="buttons"> 
                    <button (click)="addNewList(listInput.value)">add</button>
                    <button (click)="addNewListCancel()">cancel</button>
                    </div>
                </div>
        </ng-template>
    `,
    styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, OnDestroy {
    constructor(
        private auth: AuthService,
        private taskService: TaskService
    ) {}

    private destroyRef$ = new Subject()

    newListForm = new FormControl('')

    state$ = this.taskService.state$.pipe(takeUntil(this.destroyRef$))

    boardId!: string
    userId!: string

    toggleListDialog = false

    @Input()
    set id(boardId: string) {
        this.boardId = boardId
        this.taskService.fetchAll(boardId)
    }

    ngOnInit() {
        this.auth.userObservable$
            .pipe(takeUntil(this.destroyRef$))
            .subscribe((user) => {
                if (!user) return

                this.userId = user.id
            })
    }

    ngOnDestroy() {
        this.destroyRef$.next(null)
    }

    addNewList(name: string) {
        this.taskService.createList(this.boardId, name).then(() => {
            this.newListForm.reset()
            this.toggleListDialog = false
        });
    }

    addNewListCancel() {
        this.newListForm.reset()
        this.toggleListDialog = false
    }

    updateTask(task: { id: string; title: string; description: string }) {
        const payload: UpdateTaskPayload = {
            ...task,
        }

        this.taskService.update(payload)
    }

    addTask(value: string, list: List & { tasks: Task[] }) {
        const payload: Omit<CreateTaskPayload, 'position'> = {
            list_id: list.id,
            created_by: this.userId,
            title: value,
            description: '',
        }

        this.taskService.create(payload)
    }

    taskPositionChange(data: DropEvent) {
        const { currentIndex, previousIndex, container, previousContainer } =
            data.event

        const prev_list_pos = Number(previousContainer.id)
        const curr_list_pos = Number(container.id)

        const task_moved = data.lists[prev_list_pos].tasks[previousIndex]

        const payload: UpdateTaskPosPayload = {
            id: task_moved.id,
            curr_pos: currentIndex,
            prev_pos: previousIndex,
            curr_list_pos,
            prev_list_pos,
        }

        this.taskService.updateTaskPosition(payload);
    }
}

export type DropEvent = {
    event: CdkDragDrop<Task[]>
    lists: (List & { tasks: Task[] })[]
}
