import { Component } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loading = false

  signInForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
  })

  error?: string;

  constructor(
    private auth: AuthService,
    private route: Router,
    private formBuilder: FormBuilder,
  ) {}

  onSubmit(): void {
      const form = this.signInForm;
      if(form.invalid) return; 

      const email = this.signInForm.get('email')!.value;
      const password = this.signInForm.get('password')!.value;

      try {
          this.loading = true;
          
          this.auth.login(email!, password!).then(() =>{
              this.route.navigate(['/dashboard']);
          });
      } catch(e: any) {
          this.error = e.err.message as string;
      } finally {
          this.loading = false;
      }
 }
}
