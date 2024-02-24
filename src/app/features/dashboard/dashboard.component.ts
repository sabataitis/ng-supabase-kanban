import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { DashboardService } from './services/dashboard.service'
import { AuthService } from '../../core/services/auth.service'
import { Subject, takeUntil } from 'rxjs'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'

@Component({
    selector: 'app-dashboard',
    standalone: true,
    providers: [DashboardService],
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
        <div>
            <h1>Your boards:</h1>
                <div class="boards" *ngIf="boards$ | async as boards">
                    @for (board of boards; track board) {
                        <a class="board" [routerLink]="['/boards', board.id]">
                            <div class="card">
                                <h5>{{ board.name }}</h5>
                            </div>
                        </a>
                    }
                </div>

            <ng-container *ngIf="!toggle; else dialog">
                <button (click)="toggle = !toggle">Add new board</button>
            </ng-container>
        </div>

        <ng-template #dialog>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div>
                    <label for="name">Name:</label>
                    <input type="text" formControlName="name" />
                </div>
                <div>
                    <label for="description">Description:</label>
                    <textarea rows="10" formControlName="description">
                    </textarea>
                </div>
                <button type="submit" [disabled]="form.invalid">submit</button>
            </form>
        </ng-template>
    `,
})
export class DashboardComponent implements OnInit, OnDestroy {
    constructor(
        private fb: FormBuilder,
        private dashboardService: DashboardService,
        private auth: AuthService
    ) {}

    boards$ = this.dashboardService.boards$
    userId!: string

    form = this.fb.group({
        name: this.fb.control('', Validators.required),
        description: this.fb.control('', Validators.required),
    })

    toggle = false

    private destroyRef$ = new Subject()

    ngOnInit() {
        this.auth.userObservable$
            .pipe(takeUntil(this.destroyRef$))
            .subscribe((user) => {
                if (!user) return

                this.userId = user.id
                this.dashboardService.getBoards(this.userId)
            })
    }

    ngOnDestroy() {
        this.destroyRef$.next(null)
    }

    onSubmit() {
        if (this.form.invalid) return

        const formValue = this.form.value
        const payload = {
            name: formValue.name!,
            description: formValue.description!,
            created_by: this.userId,
        }

        this.dashboardService.createBoard(payload)
    }
}
