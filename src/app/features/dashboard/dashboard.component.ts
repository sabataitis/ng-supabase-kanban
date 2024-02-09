import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core'
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
            <ng-container *ngIf="boards$ | async as boards">
                <div class="boards">
                    @for (board of boards; track board) {
                        <a [routerLink]="['/boards', board.id]">
                        <div>
                        <h2> {{board.name}} </h2>
                        <p> {{board.description}} </p>
                        </div>
                        </a>
                    }
                </div>
            </ng-container>

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
                    <textarea rows="10" cols="10" formControlName="description"> </textarea>
                </div>
                    <input
                        type="submit"
                        [disabled]="form.invalid"
                        value="submit"
                    />
                </form>
        </ng-template>
    `,
    styles: ``,
})
export class DashboardComponent implements OnInit, OnDestroy {
    constructor(private fb: FormBuilder, private dashboardService: DashboardService, private auth: AuthService) {}

    boards$ = this.dashboardService.boards$;
    userId!: string;

    form = this.fb.group({
        name: this.fb.control('', Validators.required),
        description: this.fb.control('', Validators.required),
    });

    toggle = false;

    private destroyRef$ = new Subject()

    ngOnInit() {
        this.auth.userObservable$.pipe(takeUntil(this.destroyRef$)).subscribe((user) => {
            if(!user) return;

            this.userId = user.id;
            this.dashboardService.getBoards(this.userId);
        })
    }

    ngOnDestroy() {
        this.destroyRef$.next(null);
    }

    onSubmit() {
        if(this.form.invalid) return;

        const formValue = this.form.value;
        const payload = {
            name: formValue.name!,
            description: formValue.description!,
            created_by: this.userId,
        }

        this.dashboardService.createBoard(payload);
    }
}
