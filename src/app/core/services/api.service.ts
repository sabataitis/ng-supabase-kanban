import { Injectable } from '@angular/core'
import { PostgrestResponse } from '@supabase/supabase-js'
import { TABLES } from '../../shared/constants/tables';
import { SupabaseInitService } from './supabase-init.service';

@Injectable({ providedIn: 'root' })
export class SupabaseApiService {
    constructor(private supabase: SupabaseInitService) {}

    // SELECT method
    async select<T>(payload: SelectPayload<T>): Promise<PostgrestResponse<T>> {
        const { table, fields, eq } = payload;

        const select = ((fields || []) as string[]).join(',');

        if(eq && eq.key && eq.value) {
            return (this.supabase.client.from(table).select(select).eq(eq.key, eq.value) as any as PostgrestResponse<T>);
        }

        return this.supabase.client.from(table).select(select);
    }

    // INSERT method
    async insert<T>(payload: InsertPayload<T>): Promise<PostgrestResponse<T>> {
        const { table, values } = payload;

        return this.supabase.client.from(table).insert(values).select();
    }

    // UPDATE method
    async update<T>(payload: UpdatePayload<T>): Promise<PostgrestResponse<T>> {
        const { table, values, eq } = payload;

        if(eq && eq.key && eq.value) {
            return (this.supabase.client.from(table).update(values).eq(eq.key, eq.value).select() as any as PostgrestResponse<T>);
        }

        return (this.supabase.client.from(table).update(values).select() as any as PostgrestResponse<T>);
    }
}

export type InsertPayload<T> = {
    table: TABLES,
    values: Partial<Record<keyof T, string | number>>
}

export type UpdatePayload<T> = {
    table: TABLES,
    values: Partial<Record<keyof T, string | number>>,
    eq?: EQ<T>
}

export type SelectPayload<T> = {
    table: TABLES,
    fields?: Partial<Array<keyof T>>,
    eq?: EQ<T>
}

export type EQ<T> = {
    key: keyof T & string,
    value: string | number,
}
