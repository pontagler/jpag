import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-login',
  standalone: false,
  
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialization logic can go here
  }

  login() {
    this.loading = true;
    console.log('Host login attempt:', this.email, this.password);
    
    // Simulate login process (no database connection)
    setTimeout(() => {
      if (this.email && this.password) {
        console.log('Host login successful');
        this.alertService.showAlert('Login Successful', 'Welcome to your host dashboard!', 'success');
        // Navigate to host dashboard (adjust route as needed)
        // this.router.navigate(['/hosts/dashboard']);
        this.loading = false;
      } else {
        console.error('Host login failed - missing credentials');
        this.alertService.showAlert('Login Failed', 'Please enter both email and password.', 'error');
        this.loading = false;
      }
    }, 1000); // Simulate network delay
  }
}
