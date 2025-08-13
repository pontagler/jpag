import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../services/artist.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-password-reset',
  imports: [FormsModule, NgIf, SharedModule],
  templateUrl: './password-reset.component.html'
})
export class PasswordResetComponent  implements OnInit{

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService
  ){
 let param = this.route.snapshot.params['id'];
        this.token = this.route.snapshot.queryParamMap.get('token') || '';
    console.log('token' ,this.token)

  }
  async ngOnInit() {
    


     this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    // If no token, this might be a direct access to reset page
    if (!this.token) {
      this.showError = true;
      this.errorMessage = 'Invalid reset link. Please request a new one.';
    }

  }
  newPassword: string = '';
  confirmPassword: string = '';
  isSubmitting: boolean = false;
  showSuccess: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';
  token: string = '';
  
  get isPasswordMismatch(): boolean {
    return !!this.confirmPassword && this.newPassword !== this.confirmPassword;
  }

  async handleReset() {
    console.log('this is ok')
    
    this.isSubmitting = true;
    this.showError = false;
    
    try {
     if (this.isPasswordMismatch) {
       this.showError = true;
       this.errorMessage = 'Passwords do not match';
       return;
     }
     this.artistService.resetPass(this.newPassword).then(()=>{
      this.showSuccess = true;

     })
      
     
      
      
    } catch (error: any) {
      this.showError = true;
      this.errorMessage = error.message || 'Failed to reset password';
    } finally {
      this.isSubmitting = false;
    }
  }

  navigateToLogin() {
    this.router.navigate(['artistspace/login']);
  }



}
