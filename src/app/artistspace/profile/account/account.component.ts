import { Component, effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ArtistService } from '../../../services/artist.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  // Artist profile data
  artistProfile: any = {
    fname: '',
    lname: '',
    tagline: '',
    photo: '',
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
  artistID: any;
  authID: any;

  constructor(
    private artistService: ArtistService,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    effect(() => {
      this.artistProfile = this.artistService.getArtistProfilebyID();
      this.artistID = this.artistService.getArtistID();
    });
  }

  ngOnInit(): void {
    this.getArtistProfile();
    this.artistID = this.artistService.getArtistID();
    this.authID = this.artistService.getArtistProfileID();
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

    this.artistService
      .updateInfo(
        this.artistID,
        this.authID,
        this.artistProfile.fname,
        this.artistProfile.lname,
        this.artistProfile.tagline
      )
      .then(() => {
        this.nameClick = false;
        this.editName = false;
        this.alertService.showAlert('Updated', 'Name is updated', 'success');
      })
      .catch((error) => {
        this.alertService.showAlert('Internal Error', error.message, 'error');
      });
  }

  updateTagline() {
    this.taglineClick = true;
    // Simulate API call delay
    this.artistService
      .updateInfo(
        this.artistID,
        this.authID,
        this.artistProfile.fname,
        this.artistProfile.lname,
        this.artistProfile.tagline
      )
      .then(() => {
        this.taglineClick = false;
        this.editTagline = false;
        this.alertService.showAlert('Updated', 'Tagline updated', 'success');
      })
      .catch((error) => {
        this.alertService.showAlert('Internal Error', error.message, 'error');
      });
  }

  selectedFile: File | null = null;
  // File upload handling
  onFileSelected(event: any) {
    const file = event.target.files[0];
   if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  updatePhoto() {
  if (!this.selectedFile) {
    this.alertService.showAlert('No file selected', 'Please upload a new photo', 'error');
    return;
  }

  this.photoClick = true;

  this.artistService
    .replaceArtistPhoto(this.artistID, this.authID, this.artistProfile.photo || null, this.selectedFile)
    .then((res) => {
      
      this.artistProfile.photo = res;
      this.alertService.showAlert('Profile Updated', 'Photo has been updated', 'success');
      this.photoClick = false;
      this.editPhoto = false;
    })
    .catch(error => {
      this.alertService.showAlert('Internal Error', error.message, 'error');
      this.photoClick = false;
    });
}


  updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
    }

    this.authService
      .changePassword(this.newPassword)
      .then((res) => {
        this.passwordClick = true;
        // Simulate API call delay

        console.log('password Chod', res);

        this.passwordClick = false;
        this.changePassword = false;
        this.clearPasswordFields();

        this.alertService.showAlert(
          'Success',
          'Password is changed',
          'success'
        );
      })
      .catch((error) => {
        console.log('password error', error);
        this.alertService.showAlert('Error', error.message, 'error');
      });
  }

  clearPasswordFields() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
  
}
