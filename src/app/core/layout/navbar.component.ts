import { Component, EventEmitter, Input, Output } from '@angular/core'
import { RouterLink, RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { User } from '../../shared'

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterModule, CommonModule, RouterLink],
    providers: [],
    template: `
        <nav class="navbar">
            <ul>
                <li><strong>ng supabase</strong></li>
            </ul>
            <ul *ngIf="user; else auth">
                <li><a [routerLink]="['dashboard']">dashboard</a></li>
                <li><a (click)="logout.emit()">logout</a></li>
                <li> <span>{{ user.name }}</span></li>
            </ul>
        </nav>
        <ng-template #auth>
            <ul>
                <li><a [routerLink]="['login']">login</a></li>
                <li><a [routerLink]="['register']">register</a></li>
            </ul>
        </ng-template>
    `,
})
export class NavbarComponent {
    @Input() user!: User | null
    @Output() logout: EventEmitter<void> = new EventEmitter()
}
