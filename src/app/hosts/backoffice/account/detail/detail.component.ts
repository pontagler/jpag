import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../services/account.service';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-account-detail',
  standalone: false,
  templateUrl: './detail.component.html'
})
export class AccountDetailComponent implements OnInit {
  id_user: string | null = null;
  loading: boolean = false;
  activeTab: 'details' | 'system' = 'details';
  user: any = null;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id_user = this.route.snapshot.paramMap.get('id');
    if (!this.id_user) {
      this.alertService.showAlert('Invalid route', 'Missing user id', 'error');
      return;
    }
    this.fetchUser(this.id_user);
  }

  async fetchUser(id_user: string) {
    this.loading = true;
    try {
      this.user = await this.accountService.getAccountById(id_user);
    } catch (e: any) {
      this.alertService.showAlert('Error', e.message || 'Failed to load user', 'error');
    } finally {
      this.loading = false;
    }
  }

  setTab(tab: 'details' | 'system') {
    this.activeTab = tab;
  }

  async resetPassword() {
    try {
      const result = await this.alertService.dialogAlert('Reset password to a new value?', 'Yes, reset', 'No', true);
      if (result.isConfirmed) {
        const newPassword = prompt('Enter new password');
        if (!newPassword || newPassword.trim().length < 6) {
          this.alertService.showAlert('Invalid', 'Password must be at least 6 characters', 'warning');
          return;
        }
        await this.authService.changePassword(newPassword.trim());
        this.alertService.showAlert('Success', 'Password updated', 'success');
      }
    } catch (e: any) {
      this.alertService.showAlert('Error', e.message || 'Failed to reset password', 'error');
    }
  }
}
