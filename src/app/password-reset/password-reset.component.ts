import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from '../services/auth.service';
import { supabase } from '../core/supabase';

@Component({
  selector: 'app-password-reset',
  imports: [FormsModule, NgIf, SharedModule],
  templateUrl: './password-reset.component.html'
})
export class PasswordResetComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  isSubmitting = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';
  isAuthenticating = true;
  returnTo = '/artistspace';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.returnTo = this.route.snapshot.queryParamMap.get('from') === 'hosts'
      ? '/hosts'
      : '/artistspace';

    const hasRecoveryLink = this.hasRecoveryParams();
    if (!hasRecoveryLink) {
      this.isAuthenticating = false;
      this.showError = true;
      this.errorMessage = 'Invalid or expired reset link. Please request a new one.';
      return;
    }

    const established = await this.establishRecoverySession();
    this.isAuthenticating = false;

    if (!established) {
      this.showError = true;
      this.errorMessage = 'Could not verify your reset link. Please request a new one.';
    }
  }

  private hasRecoveryParams(): boolean {
    const hash = window.location.hash;
    const search = window.location.search;
    return (
      (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) ||
      search.includes('code=') ||
      search.includes('token=')
    );
  }

  private async establishRecoverySession(): Promise<boolean> {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        this.clearRecoveryParamsFromUrl();
        return true;
      }
    }

    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.clearRecoveryParamsFromUrl();
        return true;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  private clearRecoveryParamsFromUrl(): void {
    const params = new URLSearchParams(window.location.search);
    params.delete('code');
    params.delete('token');
    const query = params.toString();
    history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''));
  }

  get isPasswordMismatch(): boolean {
    return !!this.confirmPassword && this.newPassword !== this.confirmPassword;
  }

  async handleReset(): Promise<void> {
    if (this.isPasswordMismatch) {
      this.showError = true;
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isSubmitting = true;
    this.showError = false;

    try {
      await this.authService.changePassword(this.newPassword);
      this.showSuccess = true;
    } catch (error: any) {
      this.showError = true;
      this.errorMessage = error?.message || 'Failed to reset password';
    } finally {
      this.isSubmitting = false;
    }
  }

  navigateToLogin(): void {
    this.router.navigate([this.returnTo]);
  }
}