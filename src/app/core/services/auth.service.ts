import { Injectable } from '@angular/core'
import { AuthError, AuthTokenResponsePassword, User as SupabaseUser, UserResponse } from '@supabase/supabase-js'
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
        this.supabaseStream$.pipe(skipWhile((v) => typeof v === 'undefined'))

    userStream$: BehaviorSubject<User | null | undefined> = new BehaviorSubject<
        User | null | undefined
    >(undefined)
    userObservable$: Observable<User | null | undefined> = this.userStream$.pipe(skipWhile((v) => typeof v === 'undefined'))

    async getCurrentSession() {
        try {
            const session: UserResponse = await this.supabase.client.auth.getUser();
            this.supabaseStream$.next(session?.data?.user ?? null)

        } catch (error) {
            this.supabaseStream$.next(null)
        }
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

    async register(email: string, password: string): Promise<{ ok: boolean }> {
        try {
            const res = await this.supabase.client.auth.signUp({ email, password })
            if(res.error) throw new Error(res.error.message);
            return { ok: true };
        } catch(e) {
            console.warn("Error registering:", e);
            return { ok: false };
        }
    }

    async login(email: string, password: string): Promise<AuthTokenResponsePassword> {
        this.supabaseStream$.next(undefined)
        this.userStream$.next(undefined)

        try {
            const res = await this.supabase.client.auth.signInWithPassword({ email, password });

            if(res.data && res.data.user) {
                this.supabaseStream$.next(res.data.user);
            }

            return res;

        } catch(e) {
            this.supabaseStream$.next(null)
            return {
                data: { user: null, session: null },
                error: new AuthError('Could not log in, please try again', 500)
            }
        }
    }

    async logout() {
        try {
            await this.supabase.client.auth.signOut();
            this.supabaseStream$.next(null);
        } catch(e) {
            console.warn("Error logging out: ", e)
            this.supabaseStream$.next(null);
        }
    }
}
