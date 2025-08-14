import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../services/artist.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-confirm-artist',
  imports: [FormsModule, NgIf, SharedModule],
  templateUrl: './confirm-artist.component.html'
})
export class ConfirmArtistComponent implements OnInit {
  constructor(
      private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService,
    
  ){}

  newPassword: string = '';
  confirmPassword: string = '';
  
  showSuccess: boolean = false;
  isSubmitting: boolean = false;
    token: string = '';
    showError: boolean = false;
    errorMessage: string = '';

  ngOnInit(): void {
         this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    // If no token, this might be a direct access to reset page
    if (!this.token) {
      this.showError = true;
      this.errorMessage = 'Invalid reset link. Please request a new one.';
    }
  }
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
