import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { ArtistService } from '../../services/artist.service';

@Component({
  selector: 'app-login',
  standalone: false,
  
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  showForgot = false;
  resetEmail = '';

  constructor(
    private alertService: AlertService,
    private router: Router,
    private authService: AuthService,
    private artistService: ArtistService
  ) {}

  ngOnInit() {}

  async login() {
    this.loading = true;
    console.log('Host login attempt:', this.email, this.password);
    
          if (this.email && this.password) {
            await this.authService.signIn(this.email, this.password).then((res)=>{
              const rolename = res.rolename;
              if(rolename == 'admin'){
              this.artistService.setLoggedUserID(res.id_user);

 this.alertService.showAlert('Login Successful', 'Welcome to your host dashboard!', 'success');
 this.loading = false;
              }else{
                 this.alertService.showAlert('Login Failed', 'You are not a registered host', 'error');
                 this.loading = false;
              }

              this.artistService.setArtistProfileID(res.id);
              this.router.navigate(['hosts/console/home']);
              


              
                             
            }).catch(error=>{
        this.alertService.showAlert('Login Failed', error.message, 'error');
        this.loading = false;

            })


          }
        }

  async sendResetEmail(): Promise<void> {
    try {
      if (!this.resetEmail) {
        this.alertService.showAlert('Missing Email', 'Please enter your email to reset.', 'error');
        return;
      }
      await this.authService.requestPasswordReset(this.resetEmail, 'hosts');
      this.alertService.showAlert('Email Sent', 'Check your inbox for the reset link.', 'success');
      this.showForgot = false;
      this.resetEmail = '';
    } catch (err: any) {
      this.alertService.showAlert('Reset Failed', err?.message || 'Could not send reset email.', 'error');
    }
  }
}
