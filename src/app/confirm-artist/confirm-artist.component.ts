import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../services/artist.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { supabase } from '../core/supabase';

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
    private authService: AuthService
  ){}

  newPassword: string = '';
  confirmPassword: string = '';
  
  showSuccess: boolean = false;
  isSubmitting: boolean = false;
  isAuthenticating: boolean = true;
  showError: boolean = false;
  errorMessage: string = '';

  async ngOnInit(): Promise<void> {
    // Check if there's a hash in the URL (Supabase auth callback)
    const hash = window.location.hash;
    
    if (hash && hash.includes('access_token')) {
      // Supabase will automatically handle the session via the hash
      // Wait a moment for the session to be established
      setTimeout(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log('User authenticated successfully:', user.email);
            this.isAuthenticating = false;
          } else {
            this.showError = true;
            this.errorMessage = 'Authentication failed. Please try the link again.';
            this.isAuthenticating = false;
          }
        } catch (error: any) {
          console.error('Error getting user:', error);
          this.showError = true;
          this.errorMessage = 'Authentication failed. Please try the link again.';
          this.isAuthenticating = false;
        }
      }, 1000);
    } else {
      // No hash found - might be direct access or expired link
      this.isAuthenticating = false;
      this.showError = true;
      this.errorMessage = 'Invalid or expired confirmation link. Please request a new one.';
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
