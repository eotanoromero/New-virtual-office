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

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, ReactiveFormsModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
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

    onSubmit() {
        const { identifier, password } = this.loginForm.value;

        const success = this.authService.login(identifier, password);

        if (!success) {
            this.errorMessage = 'Código o contraseña incorrectos';
        }
    }
    register() {
        this.router.navigate(['user/register']);
    }
}
