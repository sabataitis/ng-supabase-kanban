import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { first, map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

export function NonAuthGuard(): CanActivateFn {
  return () => {
    const auth: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    return auth.userObservable$.pipe(map(v => {
        return v ? router.navigate(['/dashboard']) : true;
    })) as any;
  };
}
