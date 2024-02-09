import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js'

import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SupabaseInitService {
    client: SupabaseClient;

    constructor() {
        this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
    }
}
