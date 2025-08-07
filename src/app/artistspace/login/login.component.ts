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
  email: string = 'a@a.com';
  password: string = 'p';

  constructor(
    private artistService: ArtistService,
    private authService: AuthService,
    private alertService: AlertService, // Inject the AlertService
private router: Router // Inject the Router if you need to navigate after login
  
  ) {}
  ngOnInit() {
    // Initialization logic can go here
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
        this.email = 'a@a.com';
        this.password = 'p';
        // Handle login error, e.g., showing an error message to the user
      });


  }

  loading:any = false;

}
