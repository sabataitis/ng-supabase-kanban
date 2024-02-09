import { Injectable } from '@angular/core'
import { AuthResponse, User as SupabaseUser } from '@supabase/supabase-js'
import { BehaviorSubject, Observable, skipWhile } from 'rxjs'
import { SupabaseInitService } from './supabase-init.service'
import { User } from '../../shared'

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private supabase: SupabaseInitService) {
        this.subscribeToSupabaseState()
    }
    supabaseStream$: BehaviorSubject<SupabaseUser | null | undefined> =
        new BehaviorSubject<SupabaseUser | null | undefined>(undefined)
    supabaseObservable$: Observable<SupabaseUser | null | undefined> =
        this.supabaseStream$
            .asObservable()
            .pipe(skipWhile((v) => typeof v === 'undefined'))

    userStream$: BehaviorSubject<User | null | undefined> = new BehaviorSubject<
        User | null | undefined
    >(undefined)
    userObservable$: Observable<User | null | undefined> = this.userStream$
        .asObservable()
        .pipe(skipWhile((v) => typeof v === 'undefined'))

    getCurrentSession() {
        // Get initial user from the current session, if exists
        this.supabase.client.auth.getUser().then(({ data, error }) => {
            this.supabaseStream$.next(
                data && data.user && !error ? data.user : null
            )
        })
    }

    subscribeToSupabaseState() {
        this.supabaseObservable$.subscribe((user) => {
            if (user) {
                const profilePromise = this.supabase.client
                    .from('users')
                    .select(`id, name, email`)
                    .eq('id', user.id)
                    .single()

                profilePromise.then((res) => {
                    this.userStream$.next(res.data ?? null)
                })
            } else {
                this.userStream$.next(null)
            }
        })
    }

    register(email: string, password: string): Promise<AuthResponse> {
        return this.supabase.client.auth.signUp({ email, password })
    }

    login(email: string, password: string) {
        this.userStream$.next(undefined)

        return this.supabase.client.auth
            .signInWithPassword({ email, password })
            .then((res) => {
                if (!res.error && res.data) {
                    this.supabaseStream$.next(res.data.user)
                }
            })
    }

    logout() {
        return this.supabase.client.auth.signOut().then(() => {
            this.supabaseStream$.next(null)
        })
    }
}
