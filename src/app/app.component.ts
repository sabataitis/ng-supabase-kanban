import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterOutlet } from '@angular/router'
import { Observable } from 'rxjs'
import { AuthService } from './core/services/auth.service'
import { NavbarComponent } from './core/layout/navbar.component'
import { User } from './shared'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NavbarComponent],
    styleUrls: ['./app.component.scss'],
    template: `
        <app-navbar (logout)="logout()" [current]="currentUser$ | async"></app-navbar>
        <main>
            <router-outlet></router-outlet>
        </main>
    `,
    styles: [],
})
export class AppComponent implements OnInit {
    constructor(private auth: AuthService, private router: Router) { }

    currentUser$ = this.auth.userObservable$ as Observable<User | null>;

    ngOnInit() {
        this.auth.getCurrentSession()
    }

    logout() {
        this.auth.logout().then(() => {
            this.router.navigate(['login']);
        });
    }
}
