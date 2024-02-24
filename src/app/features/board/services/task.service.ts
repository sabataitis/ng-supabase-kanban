import { Injectable } from '@angular/core'
import {
    BehaviorSubject,
    Observable,
    distinctUntilChanged,
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
               lists(id, name, position, tasks(id, title, description, position))
       `
            )
            .order('position', { referencedTable: 'lists.tasks', ascending: true })
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

    async create(data: Omit<CreateTaskPayload, 'position'>) {
        // TODO implement endpoint
        const payload: InsertPayload<CreateTaskPayload> = {
            table: TABLES.tasks,
            values: {
                ...data,
            },
        }

        const nextPosition = (await this.supabase.client.rpc('increment_task_position', { list_id_input: data.list_id })).data;
        payload.values.position = nextPosition;

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

    async updateTaskPosition(data: UpdateTaskPosPayload) {
        const curr = this.stateSubject$.value!

        const find = curr.lists[data.prev_list_pos]?.tasks?.find(t=> t.id === data.id);

        const curr_list = curr.lists[data.curr_list_pos];

        if(!find || !curr_list) {
            throw Error('could not update position');
        }

        const prev = curr_list.tasks[data.curr_pos - 1]?.position ||  0 ;
        const next = curr_list.tasks[data.curr_pos]?.position || prev + 100;

        const length = curr_list.tasks.length;
        let position = prev + ((next - prev) / 2);

        if(!length) {
            position = 100;
        } else if (length === data.curr_pos + 1) {
            position = prev + 100;
        }

        const payload: UpdatePayload<Task> = {
            table: TABLES.tasks,
            values: { position, list_id: curr_list.id },
            eq: { key: 'id', value: data.id },
        }

        this.api.update<Task>(payload).then((res)=> {
            console.info({res});
            if(!res.error && res.data) {
                let curr = this.stateSubject$.value!

                curr.lists[data.curr_list_pos].tasks.splice(
                    data.curr_pos,
                    0,
                    curr.lists[data.prev_list_pos].tasks.splice(data.prev_pos, 1)[0]
                )

                this.stateSubject$.next(curr)
            } else {
                // TODO: err handling
                console.warn('could not update task position', res);
            }
        })
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
