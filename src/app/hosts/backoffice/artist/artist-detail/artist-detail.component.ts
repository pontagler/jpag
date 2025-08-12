import { NgClass, NgFor, NgIf, CommonModule, DatePipe } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../../../services/artist.service';
import { FormsModule, NgModel } from '@angular/forms';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-artist-detail',
  imports: [NgClass, NgFor, NgIf, CommonModule, DatePipe, FormsModule],
  templateUrl: './artist-detail.component.html'
})
export class ArtistDetailComponent implements OnInit {

  constructor(
    private artistService: ArtistService,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {
        effect(() => {
      this.artistProfileID = this.artistService.getLogedUserID();
        })
   }
artistProfileID:any;
  activeTab: string = 'details'; // default active tab
  artistProfile: any = null;
  artistID: string | null = null;
  loading: boolean = true;
  error: string | null = null;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }
instruments:any = [];
  async ngOnInit(): Promise<void> {
    try {
      // Get artistID from route parameters
      this.artistID = this.route.snapshot.paramMap.get('id');
      this.artistProfileID = this.artistService.getLogedUserID();
console.log('this is artist profile id', this.artistProfileID)
      if (this.artistID) {
        // Fetch artist profile using the service
        const profile = await this.artistService.getArtistProfile_v1(this.artistID);
        this.artistProfile = profile[0];
        this.instruments = profile[0].instruments;
        this.featureArtist = profile[0].is_featured;
        this.activeArtist = profile[0].status;
        
        console.log('Artist Profile loaded:', this.instruments);
        this.loading = false;
      } else {
        this.error = 'Artist ID not found in route parameters';
        this.loading = false;
      }
    } catch (error: any) {
      this.error = error.message || 'Failed to load artist profile';
      this.loading = false;
      console.error('Error loading artist profile:', error);
    }
  }

  // Helper method to get artist's full name
  getFullName(): string {
    if (!this.artistProfile) return '';
    return `${this.artistProfile.fname || ''} ${this.artistProfile.lname || ''}`.trim();
  }


goTo(id:any){

}

changeSystem:boolean = true;
changesystemFunction(){
  this.changeSystem = false;
}
activeArtist:any;
featureArtist:any;

updateSystemFunction(){
let arr = {
  status:  this.activeArtist == true ?1:0,
  is_featured: this.featureArtist,
  last_updated: new Date(),
  last_updated_by: this.artistProfileID
}

try{
  const datax = this.artistService.updateArtistStatus(arr,this.artistID)
  console.log(datax);
    this.changeSystem = true;

}catch(error){
  console.log(error)
}
}

updateDetailBtn:boolean = true;

updateDetail(){
  
  let arr = {
    fname: this.artistProfile.fname,
    lname:this.artistProfile.lname,
    email:this.artistProfile.email,
    phone:this.artistProfile.phone,
    tagline:this.artistProfile.tagline,
    website:this.artistProfile.website,
    city:this.artistProfile.city,
    proviance:this.artistProfile.proviance,
    country:this.artistProfile.country,
    photo:this.artistProfile.photo,
    short_bio: this.artistProfile.short_bio,
    long_bio:this.artistProfile.long_bio,
    last_updated: new Date(),
    last_updated_by: this.artistProfileID
  }



try{

  this.artistService.updateArtistDetail(arr, this.artistID, this.artistProfile.id).then(()=>{
  this.alertService.showAlert('Successful', 'Artist profile is updated', 'success');
    this.updateDetailBtn = true;
  })


}catch(error:any){
  this.alertService.showAlert('Internal Error', error.message, 'error');
}


}




}
