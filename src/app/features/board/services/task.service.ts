import { Injectable } from '@angular/core'
import {
    BehaviorSubject,
    Observable,
    distinctUntilChanged,
    of,
    skipWhile,
} from 'rxjs'
import {
    InsertPayload,
    SupabaseApiService,
    UpdatePayload,
} from '../../../core/services/api.service'
import { TABLES } from '../../../shared/constants/tables'
import { SupabaseInitService } from '../../../core/services/supabase-init.service'
import { List, Task } from '../../../shared'

@Injectable()
export class TaskService {
    private stateSubject$ = new BehaviorSubject<
        BoardListsAndTasksResponse | null | undefined
    >(undefined)
    state$ = this.stateSubject$.pipe(
        distinctUntilChanged(),
        skipWhile((t) => typeof t === 'undefined')
    ) as Observable<BoardListsAndTasksResponse | null | undefined>

    constructor(
        private api: SupabaseApiService,
        private supabase: SupabaseInitService
    ) {}

    fetchAll(boardId: string): void {
        this.supabase.client
            .from('boards')
            .select(
                `
               id,
               name,
               lists(id, name, position, tasks(id, title, description))
       `
            )
            .eq('id', boardId)
            .then((res) => {
                if (!res.error && res.data) {
                    const data = res.data[0] as any as BoardListsAndTasksResponse
                    this.stateSubject$.next(data)
                } else {
                    this.stateSubject$.next(null)
                }
            })
    }

    create(data: CreateTaskPayload) {
        // TODO implement endpoint
        const payload: InsertPayload<CreateTaskPayload> = {
            table: TABLES.tasks,
            values: {
                ...data,
            },
        }

        this.api.insert<Task>(payload).then((res) => {
            if (!res.error && res.data) {
                const curr = this.stateSubject$.value

                const task = res.data[0] as Task

                if (curr && curr.lists.length) {
                    // update state on response TODO
                    this.stateSubject$.next({
                        ...curr,
                        lists: curr.lists.map((c) => {
                            if (c.id === data.list_id) {
                                c.tasks.push(task)
                                return c
                            }
                            return c
                        }),
                    })
                }
            } else {
                // TODO: err handling
                console.warn('could not create task ->', res.error);
            }
        })
    }

    updatePos(payload: UpdateTaskPosPayload) {
        const curr = this.stateSubject$.value!

        const elementToMove = curr.lists[payload.prev_list_pos].tasks.splice(
            payload.prev_pos,
            1
        )[0]

        curr.lists[payload.curr_list_pos].tasks.splice(
            payload.curr_pos,
            0,
            elementToMove
        )

        this.stateSubject$.next(curr)

        return of({ pos: payload.curr_pos })
    }

    update(data: UpdateTaskPayload) {
        const payload: UpdatePayload<Task> = {
            table: TABLES.tasks,
            values: {
                title: data.title,
                description: data.description,
            },
            eq: {
                key: 'id',
                value: data.id,
            },
        }

        this.api.update<Task>(payload).then((res)=> {
            console.info({res});
            if(!res.error && res.data) {
                let curr = this.stateSubject$.value!

                const task = res.data[0] as Task;
                const { id, list_id } = task;

                curr = {
                    ...curr,
                    lists: curr.lists.map((v) => {
                        if (v.id === list_id) {
                            const idx = v.tasks.findIndex((t) => t.id === id)
                            if (idx !== -1) {
                                v.tasks[idx] = task
                                return v
                            }
                        }
                        return v
                    }),
                }
            } else {
                // TODO: err handling
                console.warn('could not update task', res);
            }
        })
    }

    createList(boardId: string, name: string) {
        let curr = this.stateSubject$.value

        const payload: InsertPayload<CreateListPayload> = {
            table: TABLES.lists,
            values: {
                board_id: boardId,
                name,
                position: curr?.lists.length || 0,
            },
        }

        return this.api.insert<List>(payload).then((res) => {
            console.info({res});
            if (!res.error && res.data) {
                const inserted = res.data[0]

                if (inserted) {
                    const toListWithTasks = { ...inserted, tasks: [] }
                    curr!.lists.push(toListWithTasks)
                    this.stateSubject$.next(curr)
                }
            } else {
                // TODO: err handling
                console.warn('could not create list', res);
            }
        })
    }
}

export type CreateListPayload = Omit<List, 'id'>
export type CreateTaskPayload = Omit<Task, 'id'>

export type UpdateTaskPayload = {
    id: string,
    title: string,
    description: string,
}

export type UpdateTaskPosPayload = {
    id: string
    curr_pos: number
    prev_pos: number
    curr_list_pos: number
    prev_list_pos: number
}

export type BoardListsAndTasksResponse = {
    id: string
    name: string
    lists: (List & { tasks: Task[] })[],
}
