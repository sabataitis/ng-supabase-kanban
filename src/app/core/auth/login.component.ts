import { Component } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AuthTokenResponsePassword } from '@supabase/supabase-js';

@Component({
    selector: 'app-auth',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
})
export class LoginComponent {
    signInForm = this.formBuilder.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
    })

    error?: string;

    constructor(
        private auth: AuthService,
        private route: Router,
        private formBuilder: FormBuilder,
    ) { }

    async onSubmit(): Promise<void> {
        const form = this.signInForm;
        if (form.invalid) return;

        const email = this.signInForm.get('email')!.value;
        const password = this.signInForm.get('password')!.value;

        const res: AuthTokenResponsePassword = await this.auth.login(email!, password!);

        if(res.error) {
            this.error = res.error.message;
        } else {
            this.route.navigate(['/dashboard']);
        }
    }
}
