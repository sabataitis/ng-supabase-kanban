import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
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

    const res = await this.auth.register(email, password);
    if(res.ok) {
        alert('User registered successfully! Check your email');
        this.registerForm.reset();
    }
    alert('Could not register, please try again later');
  }
}
