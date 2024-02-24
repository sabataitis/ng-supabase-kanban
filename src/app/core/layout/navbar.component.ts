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
        <nav>
            <ul>
                <li><strong>ng supabase</strong></li>
            </ul>
            <ul *ngIf="current; else auth">
                <li><a href="#">dashboard</a></li>
                <li><a (click)="logout.emit()">logout</a></li>
                <li>
                    <a href="#">{{ current.name }}</a>
                </li>
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
    @Input() current!: User | null
    @Output() logout: EventEmitter<void> = new EventEmitter()
}
