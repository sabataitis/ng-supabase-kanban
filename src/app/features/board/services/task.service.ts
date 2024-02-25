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
import { PostgrestResponse } from '@supabase/supabase-js'

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

    async fetchAll(boardId: string): Promise<void> {
        try {
            const res = await this.supabase.client
                .from('boards')
                .select(
                    `
                id,
                name,
                lists(id, name, position, tasks(id, title, description, position))
                `
                )
                .order('position', {
                    referencedTable: 'lists.tasks',
                    ascending: true,
                })
                .eq('id', boardId)

            if (res.error) throw new Error(res.error.message)

            const data = res.data[0] as any as BoardListsAndTasksResponse
            this.stateSubject$.next(data || null)
        } catch (e) {
            console.warn('Error fetching tasks:', e)
            this.stateSubject$.next(null)
        }
    }

    async create(data: Omit<CreateTaskPayload, 'position'>) {
        try {
            // retrieve the next position for insert
            const increment = await this.supabase.client.rpc('increment_task_position', { list_id_input: data.list_id });
            if(increment.error) throw new Error(increment.error.message);

            const nextPosition = increment.data;

            const payload: InsertPayload<CreateTaskPayload> = {
                table: TABLES.tasks,
                values: { ...data, position: nextPosition },
            }

            const res: PostgrestResponse<Task> = await this.api.insert<Task>(payload);
            if(res.error) throw new Error(res.error.message);

            // update state
            const task = res.data[0];
            const curr = this.stateSubject$.value

            if (curr && curr.lists.length) {
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
        } catch(e) {
            console.warn('could not create task ->', e)
        }
    }

    validateUpdateTaskPositionPayload(state: BoardListsAndTasksResponse, data: UpdateTaskPosPayload) {
        // checks if such task exists in the previous list
        const find = state.lists[data.prev_list_pos]?.tasks?.find(
            (t) => t.id === data.id
        )

        const curr_list = state.lists[data.curr_list_pos]

        if (!find || !curr_list) {
            throw Error('could not update position')
        }
    }

    calculateUpdatedTaskPosition(state: BoardListsAndTasksResponse, data: UpdateTaskPosPayload) {
        const curr_list = state.lists[data.curr_list_pos]

        const prev = curr_list.tasks[data.curr_pos - 1]?.position || 0
        const next = curr_list.tasks[data.curr_pos]?.position || prev + 100

        const length = curr_list.tasks.length
        
        // floating point precision, calculate mid point
        let position = prev + (next - prev) / 2

        if (!length) {
            position = 100
        } else if (length === data.curr_pos + 1) {
            position = prev + 100
        }

        return position
    }


    async updateTaskPosition(data: UpdateTaskPosPayload) {
        try {
            const state = this.stateSubject$.value!;

            this.validateUpdateTaskPositionPayload(state, data);
            const position = this.calculateUpdatedTaskPosition(state, data);

            const payload: UpdatePayload<Task> = {
                table: TABLES.tasks,
                values: { position, list_id: state.lists[data.curr_list_pos].id },
                eq: { key: 'id', value: data.id },
            }

            const update = await this.api.update<Task>(payload);
            if(update.error) throw new Error(update.error.message);

            // update state
            state.lists[data.curr_list_pos].tasks.splice(
                data.curr_pos,
                0,
                state.lists[data.prev_list_pos].tasks.splice(
                    data.prev_pos,
                    1
                )[0]
            )

            this.stateSubject$.next(state)

        } catch(e) {
            console.warn('Could not update task position', e)
        }
    }

    async update(data: UpdateTaskPayload) {
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

        try {
            const res = await this.api.update<Task>(payload);
            if(res.error) throw new Error(res.error.message);

            let state = this.stateSubject$.value!;
            const task = res.data[0] as Task;
            // update state
            state = {
                ...state,
                lists: state!.lists.map((v) => {
                    if (v.id === task.list_id) {
                        const idx = v.tasks.findIndex((t) => t.id === task.id)
                        if (idx !== -1) {
                            v.tasks[idx] = task
                            return v
                        }
                    }
                    return v
                }),
            }
        } catch(e) {
            console.warn("Could not update task", e)
        }
    }

    async createList(boardId: string, name: string) {
        let state = this.stateSubject$.value

        const payload: InsertPayload<CreateListPayload> = {
            table: TABLES.lists,
            values: {
                board_id: boardId,
                name,
                position: state?.lists.length || 0,
            },
        }

        try {
            const res = await this.api.insert<List>(payload);
            if(res.error) throw new Error(res.error.message);

            const inserted = res.data[0] || null;
            if(inserted) {
                // update state
                state!.lists.push({ ...inserted, tasks: [] })
                this.stateSubject$.next(state);
            }

        } catch(e) {
            console.warn("Could not insert list ", e);
        }
    }
}

export type CreateListPayload = Omit<List, 'id'>
export type CreateTaskPayload = Omit<Task, 'id'>

export type UpdateTaskPayload = {
    id: string
    title: string
    description: string
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
    lists: (List & { tasks: Task[] })[]
}
