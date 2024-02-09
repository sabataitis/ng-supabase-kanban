import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthResponse } from '@supabase/supabase-js';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.registerForm = this.fb.group({
      email: fb.control('', [ Validators.required, Validators.email ]),
      password: fb.control('', [Validators.required, Validators.minLength(7)]),
    });
  }

  get email() {
      return this.registerForm.get('email');
  }

  get password() {
      return this.registerForm.get('password');
  }

  async onSubmit() {
    const form = this.registerForm.value;

    const email = form.email;
    const password = form.password;

    try {
        const res: AuthResponse = await this.auth.register(email, password);
        if(res.error) throw res.error;
        alert('Check email for verification link!');
    } catch (e) {
        console.warn({status: 'error encountered', e})
    } finally {
        this.registerForm.reset();
    }
  }
}
