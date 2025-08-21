import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AlertService } from '../../../../services/alert.service';
import { AccountService } from '../../../../services/account.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-account.component.html'
})
export class CreateAccountComponent implements OnInit {
  form: FormGroup;
  submitting: boolean = false;
  loggedUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private accountService: AccountService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      fname: ['', [Validators.required, Validators.maxLength(100)]],
      lname: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      phone: ['', [Validators.maxLength(30)]],
      city: ['', [Validators.maxLength(120)]],
      province: ['', [Validators.maxLength(120)]],
      country: ['', [Validators.maxLength(120)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();
      this.loggedUserId = user?.id ?? null;
    } catch {}
  }

  get f() { return this.form.controls; }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.loggedUserId) {
      this.alertService.showAlert('Not authenticated', 'Please login again', 'error');
      return;
    }

    this.submitting = true;
    const payload = {
      ...this.form.value,
      id_logged: this.loggedUserId
    };

    try {
      await this.accountService.createNewAdmin(payload);
      this.alertService.showAlert('Success', 'Account created successfully', 'success');
      this.router.navigate(['/hosts/console/account']);
    } catch (e: any) {
      const msg = e?.message || 'Failed to create account';
      this.alertService.showAlert('Error', msg, 'error');
    } finally {
      this.submitting = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/hosts/console/account']);
  }
}
