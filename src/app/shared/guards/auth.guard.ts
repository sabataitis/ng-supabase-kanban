import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { distinctUntilChanged, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

export function AuthGuard(): CanActivateFn {
  return () => {
    const auth: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    return auth.userObservable$.pipe(distinctUntilChanged(), tap(v => {
        return !v ? router.navigate(['/login']) : !!v;
    })) as any;
  };
}
