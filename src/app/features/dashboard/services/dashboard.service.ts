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

    getBoards(userId: string): void {
        this.boardsSubject$.next(null)

        const payload: SelectPayload<Board> = {
            table: TABLES.boards,
            fields: ['id', 'name', 'description'],
            eq: { key: 'created_by', value: userId }
        }

        this.api.select<Board>(payload).then(res=> {
            if(!res.error && res.data) {
                this.boardsSubject$.next(res.data);
            } else {
                this.boardsSubject$.next(null);
            }
        });
    }

    createBoard(data: CreateBoardPayload) {
        const payload: InsertPayload<CreateBoardPayload> = {
            table: TABLES.boards,
            values: {
                ...data,
            },
        };

        console.info({payload});

        this.api.insert<Board>(payload).then(res=> {
            if(!res.error && res.data) {
                let curr = this.boardsSubject$.value;

                console.info({res});

                const inserted = res.data[0];
                if(inserted) {
                    curr ? curr.push(inserted) : curr = [inserted];
                    this.boardsSubject$.next(curr);
                }

            } else {
                // err handling
            }
        })
    }
}

export type CreateBoardPayload = Omit<Board, 'id'>

