import { provideHttpClient, withFetch } from '@angular/common/http'
import { ApplicationConfig } from '@angular/core'
import {
    Routes,
    provideRouter,
    withComponentInputBinding,
} from '@angular/router'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { AuthGuard } from './shared/guards/auth.guard'
import { DashboardComponent } from './features/dashboard/dashboard.component'
import { BoardComponent } from './features/board/board.component'
import { NonAuthGuard } from './shared/guards/non-auth.guard'

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard()],
    },
    {
        path: 'boards/:id',
        component: BoardComponent,
        canActivate: [AuthGuard()],
    },
    {
        path: 'login',
        canActivate: [NonAuthGuard()],
        loadComponent: () =>
            import('./core/auth/login.component').then(
                (m) => m.LoginComponent
            ),
    },
    {
        path: 'register',
        canActivate: [NonAuthGuard()],
        loadComponent: () =>
            import('./core/auth/register.component').then(
                (m) => m.RegisterComponent
            ),
    },
]

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync('noop'),
    ],
}
