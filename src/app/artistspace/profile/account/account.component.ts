import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ArtistService } from '../../../services/artist.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {
  
  // Artist profile data
  artistProfile: any = {
    fname: '',
    lname: '',
    tagline: '',
    photo: ''
  };

  // Edit states
  editName = false;
  editTagline = false;
  editPhoto = false;
  changePassword = false;

  // Loading states
  nameClick = false;
  taglineClick = false;
  photoClick = false;
  passwordClick = false;

  // Password fields
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Temporary photo URL for editing
  tempPhotoUrl = '';

  constructor(
    private artistService: ArtistService,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.getArtistProfile();
  }

  getArtistProfile() {
    // Get the artist profile from the service
    this.artistProfile = this.artistService.getArtistProfilebyID();
    if (this.artistProfile) {
      this.tempPhotoUrl = this.artistProfile.photo;
    }
  }

  // Toggle edit states
  toggleEditName() {
    this.editName = !this.editName;
  }

  toggleEditTagline() {
    this.editTagline = !this.editTagline;
  }

  toggleEditPhoto() {
    this.editPhoto = !this.editPhoto;
    if (this.editPhoto) {
      this.tempPhotoUrl = this.artistProfile.photo;
    }
  }

  toggleChangePassword() {
    this.changePassword = !this.changePassword;
    if (!this.changePassword) {
      this.clearPasswordFields();
    }
  }

  // Update methods (placeholders - no database operations)
  updateName() {
    this.nameClick = true;
    // Simulate API call delay
    setTimeout(() => {
      this.nameClick = false;
      this.editName = false;
      console.log('Name updated:', this.artistProfile.fname, this.artistProfile.lname);
    }, 1000);
  }

  updateTagline() {
    this.taglineClick = true;
    // Simulate API call delay
    setTimeout(() => {
      this.taglineClick = false;
      this.editTagline = false;
      console.log('Tagline updated:', this.artistProfile.tagline);
    }, 1000);
  }

  updatePhoto() {
    this.photoClick = true;
    // Simulate API call delay
    setTimeout(() => {
      this.artistProfile.photo = this.tempPhotoUrl;
      this.photoClick = false;
      this.editPhoto = false;
      console.log('Photo updated:', this.artistProfile.photo);
    }, 1000);
  }

  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
    
  
    }

      this.authService.changePassword(this.newPassword).then((res)=>{
          this.passwordClick = true;
    // Simulate API call delay

    console.log('password Chod', res);

      this.passwordClick = false;
      this.changePassword = false;
      this.clearPasswordFields();

        this.alertService.showAlert('Success', 'Password is changed', 'success')
      }).catch(error=>{
           console.log('password error', error);
        this.alertService.showAlert('Error', error.message, 'error')

      })

  
  }

  clearPasswordFields() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // File upload handling
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.tempPhotoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
