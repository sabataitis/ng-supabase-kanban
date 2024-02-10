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
            <ng-container *ngIf="current; else auth">
                <a routerLink="">dashboard</a>
                <div class="group">
                    <p>{{ current.name }}</p>
                    <a (click)="logout.emit()" style="cursor: pointer"
                        >Log Out</a
                    >
                </div>
            </ng-container>

            <ng-template #auth>
                <div class="auth-links">
                    <a [routerLink]="['login']">Login</a>
                    <a [routerLink]="['register']">Register</a>
                </div>
            </ng-template>
        </nav>
    `,
    styles: `
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid lightgrey;

  margin-bottom: 1rem;
  padding: 1rem;

  .group {
      display: flex;
      align-items: center;
      gap: 5px;
  }
}

.navbar a {
  text-decoration: none;
}
    `,
})
export class NavbarComponent {
    @Input() current!: User | null

    @Output() logout: EventEmitter<void> = new EventEmitter()
}
