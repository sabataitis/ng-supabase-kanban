import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, distinctUntilChanged } from 'rxjs'
import { InsertPayload, SelectPayload, SupabaseApiService } from '../../../core/services/api.service'
import { TABLES, Board } from '../../../shared'

@Injectable()
export class DashboardService {
    private boardsSubject$ = new BehaviorSubject<Board[] | null>(null)
    boards$ = this.boardsSubject$.pipe(distinctUntilChanged()) as Observable<
        Board[] | null
    >

    constructor(private api: SupabaseApiService) {}

    async getBoards(userId: string): Promise<void> {
        this.boardsSubject$.next(null)

        const payload: SelectPayload<Board> = {
            table: TABLES.boards,
            fields: ['id', 'name', 'description'],
            eq: { key: 'created_by', value: userId }
        }

        try {
            const res = await this.api.select<Board>(payload)
            if(res.error) throw new Error(res.error.message);

            this.boardsSubject$.next(res.data || null);
        } catch(e) {
            console.info("Error fetching boards: ", e);
        }
    }

    async createBoard(data: CreateBoardPayload) {
        const payload: InsertPayload<CreateBoardPayload> = {
            table: TABLES.boards,
            values: {
                ...data,
            },
        };

        try {
            const res = await this.api.insert<Board>(payload);
            if(res.error) throw new Error(res.error.message);

            // update state
            const inserted = res.data[0];
            if(!inserted) throw new Error('No data returned from insert');

            let state = this.boardsSubject$.value;
            state ? state.push(res.data[0]) : state = [res.data[0]];
            this.boardsSubject$.next(state);

        } catch(e) {
            console.info("Could not create board ", e);
        }
    }
}

export type CreateBoardPayload = Omit<Board, 'id'>
