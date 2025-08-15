import { Component, effect } from '@angular/core';
import { ArtistService } from '../../../services/artist.service';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-media',
  imports: [CommonModule, FormsModule],
  templateUrl: './media.component.html',
  
})
export class MediaComponent {

  constructor(
      private artistService: ArtistService, // Assuming you have an ArtistService to 
    
  ){
    effect(() => {
    this.artistProfile = this.artistService.getArtistProfilebyID();
    if (this.artistProfile) {
      this.artistID = this.artistProfile.id || this.artistService.getArtistID();
    }
    this.loggedUser = this.artistService.getLoggedUserID();
    console.log('Artist Profile:', this.artistProfile);
  });

  

}

watchVideo(url: string): void {
  console.log('Opening video:', url);
  window.open(url, '_blank');
}


artistProfile:any= [];
artistID: any;
loggedUser: any;

// Add/Modal state for Video Media
newMediaVideo: any = {};
OpenMediaVideoForm: boolean = false;
profilePreviewUrl: string | null = null;
newMediaCD: any = {};
OpenMediaCDForm: boolean = false;

openAddVideoModal(): void {
  this.OpenMediaVideoForm = true;
}

closeForm(): void {
  this.OpenMediaVideoForm = false;
  this.OpenMediaCDForm = false;
}

async onMediaVidFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if (!file) return;

  this.profilePreviewUrl = URL.createObjectURL(file);

  try {
    this.newMediaVideo.image = await this.artistService.uploadPublicProfilePhoto(file);
  } catch (err) {
    console.error(err);
    alert('Failed to upload image.');
  }
}

submitMediaVideo(arr: any): void {
  if (!this.artistID) return;
  const dataArr = {
    id_media: 1,
    id_artist: this.artistID,
    title: arr.title,
    image: arr.image,
    description: arr.description,
    url: arr.url,
    created_by: this.loggedUser,
    created_on: new Date(),
    last_updated: new Date(),
    last_updated_by: this.loggedUser
  };

  try {
    this.artistService.addNewMediaVideo(dataArr).then(async () => {
      // Refresh profile to get new IDs and latest data
      try {
        if (this.artistID) {
          const profile = await this.artistService.getArtistProfile_v1(this.artistID);
          this.artistProfile = profile[0];
        }
      } catch (e) {
        console.warn('Refresh after add failed, updating local list only');
        this.artistProfile.media_video = [
          ...(this.artistProfile.media_video || []),
          { ...dataArr }
        ];
      }
      this.OpenMediaVideoForm = false;
      this.newMediaVideo = {};
    });
  } catch (error) {
    console.error(error);
  }
}

deleteMediaVideo(id: any): void {
  try {
    this.artistService.deleteArtistMedia(id).then(() => {
      this.artistProfile.media_video = (this.artistProfile.media_video || []).filter((item: { id: any; }) => item.id !== id);
    });
  } catch (error) {
    console.error(error);
  }
}

openAddCDModal(): void {
  this.OpenMediaCDForm = true;
}

async onMediaCDFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if (!file) return;

  this.profilePreviewUrl = URL.createObjectURL(file);

  try {
    this.newMediaCD.image = await this.artistService.uploadPublicProfilePhoto(file);
  } catch (err) {
    console.error(err);
    alert('Failed to upload image.');
  }
}

submitMediaCD(arr: any): void {
  if (!this.artistID) return;
  const dataArr = {
    id_media: 2,
    id_artist: this.artistID,
    title: arr.title,
    image: arr.image,
    description: arr.description,
    url: arr.url,
    created_by: this.loggedUser,
    created_on: new Date(),
    last_updated: new Date(),
    last_updated_by: this.loggedUser
  };

  try {
    this.artistService.addNewCDVideo(dataArr).then(async () => {
      try {
        if (this.artistID) {
          const profile = await this.artistService.getArtistProfile_v1(this.artistID);
          this.artistProfile = profile[0];
        }
      } catch (e) {
        console.warn('Refresh after add failed, updating local list only (CD)');
        this.artistProfile.media_cd = [
          ...(this.artistProfile.media_cd || []),
          { ...dataArr }
        ];
      }
      this.OpenMediaCDForm = false;
      this.newMediaCD = {};
    });
  } catch (error) {
    console.error(error);
  }
}

deleteMediaCD(id: any): void {
  try {
    this.artistService.deleteArtistMedia(id).then(() => {
      this.artistProfile.media_cd = (this.artistProfile.media_cd || []).filter((item: { id: any; }) => item.id !== id);
    });
  } catch (error) {
    console.error(error);
  }
}


}