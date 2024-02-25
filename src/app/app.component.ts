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
        <app-navbar (logout)="logout()" [user]="user$ | async"></app-navbar>
        <main>
            <router-outlet></router-outlet>
        </main>
    `,
    styles: [],
})
export class AppComponent implements OnInit {
    constructor(private auth: AuthService, private router: Router) { }

    user$ = this.auth.userObservable$ as Observable<User | null>;

    async ngOnInit() {
        await this.auth.getCurrentSession()
    }

    async logout() {
        await this.auth.logout();
        this.router.navigate(['login']);
    }
}
