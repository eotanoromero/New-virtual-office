import { Component } from '@angular/core';
import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '@/core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, ReactiveFormsModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, CommonModule],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class Login {
    email: string = '';

    password: string = '';

    checked: boolean = false;

    public loginForm: FormGroup;
    public errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            identifier: ['', [Validators.required]],
            password: ['', Validators.required]
        });
    }

    // Modificación en el Componente:
    onSubmit() {
        this.loginForm.markAllAsTouched();
        if (this.loginForm.invalid) {
            return;
        }

        const { identifier, password } = this.loginForm.value;

        this.authService.login(identifier, password).subscribe((success) => {
            if (success) {
                this.router.navigate(['/dashboard']);
            } else {
                this.errorMessage = 'Código o contraseña incorrectos';
            }
        });
    }

    register() {
        this.router.navigate(['user/register']);
    }
}
