import { Component, effect, signal} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ArtistService } from '../../../services/artist.service';
import { ProfileComponent } from '../profile.component';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  standalone: false,
})
export class ArtistComponent {

constructor(
  
  private artistService: ArtistService, // Assuming you have an ArtistService to 
  private alertService:AlertService
  
  

) {
    effect(() => {
    this.artistProfile = this.artistService.getArtistProfilebyID();
    this.artistID = this.artistService.getArtistID();
  });
}

artistProfile:any= [];
artistID:any;
authID:any;

ngOnInit() {
    this.artistID = this.artistService.getArtistID()
    this.authID = this.artistService.getArtistProfileID();
    console.log('rrrrr' , this.authID);

}


async updateShortBio(){
  await this.artistService.updateShortBio(this.artistID, this.artistProfile.short_bio, this.authID).then(()=>{
      this.alertService.showAlert('Updated', 'Short Bio is Updated', 'success');
      this.shortBio = false;
      this.shortBioClick = false;
  }).catch(error=>{
    this.alertService.showAlert('Error', error, 'error');
  })
}

shortBio:any = false;
shortBioClick:any= false;
longBio:any = false;
longBioClick:any= false;

async updateLongBio(){
  await this.artistService.updateLongBio(this.artistID, this.artistProfile.long_bio, this.authID).then(()=>{
      this.alertService.showAlert('Updated', 'Long Bio is Updated', 'success');
      this.longBio = false;
      this.longBioClick = false;
  }).catch(error=>{
    this.alertService.showAlert('Error', error, 'error');
  })
}

contactList:any = false;
contactClick:any = false;


async updateContact(){

  this.contactClick = true;
await this.artistService.updateContact(
    this.artistID, 
    this.authID,
    this.artistProfile.email,
    this.artistProfile.phone,
    this.artistProfile.website,
    this.artistProfile.city,
    this.artistProfile.country    
).then(()=>{
      this.alertService.showAlert('Updated', 'Contact is Updated', 'success');
      this.contactList = false;
      this.contactClick = false;
  }).catch(error=>{
    this.alertService.showAlert('Error', error, 'error');
  })


}

}
