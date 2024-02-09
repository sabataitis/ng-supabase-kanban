import { Component, EventEmitter, Input, Output } from '@angular/core'
import { RouterLink, RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { User } from '../../shared';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterModule, CommonModule, RouterLink],
    providers: [],
    template: `
        <nav class="navbar">
            <ng-container *ngIf="current; else auth">
                <a routerLink="">dashboard</a>
                <p>{{ current.name }}</p>
                <a (click)="logout.emit()" style="cursor: pointer">Log Out</a>
            </ng-container>

            <ng-template #auth>
                <a [routerLink]="['login']">Login</a>
                <a [routerLink]="['register']">Register</a>
            </ng-template>
        </nav>
    `,
    styles: `
    .navbar {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    `
})
export class NavbarComponent {
    @Input() current!:  User | null;

    @Output() logout: EventEmitter<void> = new EventEmitter()
}