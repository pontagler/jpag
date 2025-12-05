import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Adjust the import path as necessary
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { ArtistService } from '../../services/artist.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
})
export class LoginComponent {
  // Declare any properties needed for the component here
  // email: string = 'psx1ufg37i@daouse.com';
  // password: string = 'Saurabh@123';

  email: string = 'saurtrash@gmail.com';
  password: string = 'Public@123';
  
  
  // Forgot password / recovery state
  showForgot: boolean = false;
  resetEmail: string = '';
  isRecoveryMode: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private artistService: ArtistService,
    private authService: AuthService,
    private alertService: AlertService, // Inject the AlertService
private router: Router // Inject the Router if you need to navigate after login
  
  ) {}
  ngOnInit() {
    // Detect Supabase password recovery deep link
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash && hash.includes('type=recovery')) {
      this.isRecoveryMode = true;
      this.alertService.showAlert('Reset Password', 'Enter a new password to complete recovery.', 'info');
    }
  }


  login(){
    this.loading = true;
    console.log('user', this.email, this.password);
    // Implement login logic here, such as calling a service to authenticate the user

    this.authService.signIn(this.email, this.password)
      .then(data => {


        this.artistService.setArtistProfileID(data.id_user);
        

        console.log('Login successful', data);
        // Handle successful login, e.g., redirecting the user
          this.alertService.showAlert('Login Successful', 'Welcome back!', 'success');    
          this.router.navigate(['/artistspace/profile/artist']); // Navigate to the profile page
        // Reset the form fields after successful login
        this.loading = false;

      })
      .catch(error => {
        console.error('Login failed', error);
        this.alertService.showAlert('Login Failed', 'Please check your credentials and try again.', 'error');
        this.loading = false;
        this.email = 'saurtrash@gmail.com';
        this.password = 'Public@123';
        // Handle login error, e.g., showing an error message to the user
      });


  }

  loading:any = false;

  async sendResetEmail() {
    try {
      if (!this.resetEmail) {
        this.alertService.showAlert('Missing Email', 'Please enter your email to reset.', 'error');
        return;
      }
      await this.authService.requestPasswordReset(this.resetEmail);
      this.alertService.showAlert('Email Sent', 'Check your inbox for the reset link.', 'success');
      this.showForgot = false;
      this.resetEmail = '';
    } catch (err: any) {
      this.alertService.showAlert('Reset Failed', err?.message || 'Could not send reset email.', 'error');
    }
  }

  async updatePassword() {
    try {
      if (!this.newPassword || this.newPassword.length < 6) {
        this.alertService.showAlert('Weak Password', 'Password must be at least 6 characters.', 'error');
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.alertService.showAlert('Mismatch', 'Passwords do not match.', 'error');
        return;
      }
      await this.authService.changePassword(this.newPassword);
      this.alertService.showAlert('Password Updated', 'You can now login with your new password.', 'success');
      // Clear recovery state and URL hash
      this.isRecoveryMode = false;
      this.newPassword = '';
      this.confirmPassword = '';
      if (typeof window !== 'undefined') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (err: any) {
      this.alertService.showAlert('Update Failed', err?.message || 'Could not update password.', 'error');
    }
  }

}
