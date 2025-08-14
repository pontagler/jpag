import { NgClass, NgFor, NgIf, CommonModule, DatePipe } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../../../services/artist.service';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';

/**
 * Artist Detail Component
 * Displays and manages artist profile information
 * Allows editing of artist details and system settings
 */
@Component({
  selector: 'app-artist-detail',
  imports: [NgClass, NgFor, NgIf, CommonModule, DatePipe, FormsModule],
  templateUrl: './artist-detail.component.html',
  
})
export class ArtistDetailComponent implements OnInit {

  // Constructor initializes dependencies and sets up reactive state
  constructor(
    private artistService: ArtistService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private authService: AuthService
  ) {
    // Reactive effect to monitor logged user ID changes
    effect(() => {

      this.loggedUser = this.artistService.getLoggedUserID();
    });
  }

  // Properties declaration with type annotations
  artistProfileID: any;                    // Current logged user ID
  activeTab: string = 'details';           // Currently active tab for navigation
  artistProfile: any = null;               // Main artist profile data
  artistID: string | null = null;          // Artist ID from route parameters
  loading: boolean = true;                 // Loading state indicator
  error: string | null = null;             // Error message storage
  isEditMode: boolean = false;             // Edit mode toggle
  isSubmitting: boolean = false;           // Submission state indicator
  loggedUser: any;                      // Logged Current user
  // Form properties
  instruments: any = [];                   // Instruments array
  changeSystem: boolean = true;            // System settings edit state
  activeArtist: any;                       // Artist active status
  featureArtist: any;                      // Featured artist status
  updateDetailBtn: boolean = true;         // Update detail button state
  allInstruments: any = [];                 // All instruments array
  updateAwardBtn:boolean = true;

  /**
   * Sets the active tab for navigation
   * @param tab - Tab identifier to activate
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Checks if a specific tab is currently active
   * @param tab - Tab identifier to check
   * @returns boolean indicating if tab is active
   */
  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  /**
   * Lifecycle hook called after component initialization
   * Fetches artist profile data based on route parameters
   */
  async ngOnInit(): Promise<void> {
    this.getInstruments();

    try {
      // Extract artist ID from route parameters
      this.artistID = this.route.snapshot.paramMap.get('id');

      this.loggedUser = this.artistService.getLoggedUserID();


      // Validate artist ID exists
      if (this.artistID) {
        // Fetch artist profile using service
        const profile = await this.artistService.getArtistProfile_v1(this.artistID);
        this.artistProfile = profile[0];
        this.instruments = profile[0].instruments;
        this.selectedInstArray = this.instruments;
        this.featureArtist = profile[0].is_featured;
        this.activeArtist = profile[0].status;

        console.log('Artist Profile loaded:', this.instruments);
        console.log('Sample instrument structure:', this.instruments[0]);
        this.loading = false;
      } else {
        this.error = 'Artist ID not found in route parameters';
        this.loading = false;
      }
    } catch (error: any) {
      // Handle errors during data fetching
      this.error = error.message || 'Failed to load artist profile';
      this.loading = false;
      console.error('Error loading artist profile:', error);
    }
  }

  /**
   * Generates full name from first and last name
   * @returns formatted full name string
   */
  getFullName(): string {
    if (!this.artistProfile) return '';
    return `${this.artistProfile.fname || ''} ${this.artistProfile.lname || ''}`.trim();
  }

  /**
   * Placeholder method for navigation
   * @param id - Target ID for navigation
   */
  goTo(id: any): void {
    // Implementation would go here
  }

  /**
   * Toggles system settings edit mode
   */
  changesystemFunction(): void {
    this.changeSystem = false;
  }

  /**
   * Updates artist system settings (status and featured flag)
   */
  updateSystemFunction(): void {
    // Prepare system update payload
    let arr = {
      status: this.activeArtist == true ? 1 : 0,
      is_featured: this.featureArtist,
      last_updated: new Date(),
      last_updated_by: this.loggedUser
    };

    try {
      // Call service to update artist status
      const datax = this.artistService.updateArtistStatus(arr, this.artistID);
      console.log(datax);
      this.changeSystem = true; // Exit edit mode
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Toggles detail update button state
   */
  toggleUpdateDetail(): void {
    this.updateDetailBtn = !this.updateDetailBtn;
  }

  /**
   * Updates artist profile details
   */
  updateDetail(): void {
    // Prepare detail update payload
    let arr = {
      fname: this.artistProfile.fname,
      lname: this.artistProfile.lname,
      email: this.artistProfile.email,
      phone: this.artistProfile.phone,
      tagline: this.artistProfile.tagline,
      website: this.artistProfile.website,
      city: this.artistProfile.city,
      proviance: this.artistProfile.proviance,
      country: this.artistProfile.country,
      photo: this.artistProfile.photo,
      short_bio: this.artistProfile.short_bio,
      long_bio: this.artistProfile.long_bio,
      last_updated: new Date(),
      last_updated_by: this.loggedUser
    };

    try {
      // Call service to update artist details
      this.artistService.updateArtistDetail(arr, this.artistID, this.artistProfile.id).then(() => {
        // Show success alert
        this.alertService.showAlert('Successful', 'Artist profile is updated', 'success');
        this.updateDetailBtn = true; // Exit edit mode
      });
    } catch (error: any) {
      // Show error alert
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  // Get instruments for artist update
  getInstruments() {
    try {
      this.artistService.getInstruments().subscribe({
        next: (instruments) => {
          this.allInstruments = instruments;
          console.log('Instruments loaded:', this.allInstruments);
          this.getUniquePerfromance();
        },
        error: (error) => {
          console.error('Error loading instruments:', error);
          this.alertService.showAlert('Internal Error', error.message, 'error');
        }
      });
    } catch (error: any) {
      // Show error alert
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }
  selectedInst: any; //Selected instruments
  selectedInstArray: any = []; // Selected isntrument array

  onInstChange(e: any) {
    this.selectedInst = e.target.value;
  }

  addIntrumentData(): void {
    // Validate selection
    if (!this.selectedInst || this.selectedInst === '0') {
      this.alertService.showAlert('Selection Required', 'Please select an instrument', 'warning');
      return;
    }

    let arr = {
      id_artist: this.artistID,
      id_instrument: this.selectedInst,
      created_by: this.loggedUser
    }

    try {
      // Check for duplicates - comparing the correct properties
      let row: any = this.instruments.find((item: any) => item.id_instrument == this.selectedInst);
      console.log('Duplicate check:', row);

      if (row) {
        this.alertService.showAlert('Duplicate', 'Instrument is already added', 'warning');
        this.selectedInst = '0';
      } else {
        this.artistService.addInstruments(arr).then(() => {
          this.alertService.showAlert('Success', 'Instrument added successfully', 'success');
          this.ngOnInit();
          this.selectedInst = '0';
        }).catch((error) => {
          console.error('Error adding instrument:', error);
          this.alertService.showAlert('Error', 'Failed to add instrument', 'error');
        });
      }
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  delInstruments(id: any) {
    try {
      this.artistService.delInstruments(this.artistID, id).then(() => {
        this.ngOnInit();
        this.selectedInst = '0';
        console.log(this.selectedInstArray);
      })
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  updatePortfolio() {
    this.updateDetailBtn = true;
  }

// Delete artist media
  deleteMediaVideo(id:any){
    try{
      this.artistService.deleteArtistMedia(id).then(()=>{
        this.artistProfile.media_video = this.artistProfile.media_video.filter((item: { id: any; }) => item.id !== id);
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  // Delete artist cd
  deleteMediacd(id:any){
    try{
      this.artistService.deleteArtistMedia(id).then(()=>{
        this.artistProfile.media_cd = this.artistProfile.media_cd.filter((item: { id: any; }) => item.id !== id);
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }


  addVideoMedia(){

  }

  selectedPerf:any;
  onPerfChange(e:any){
        this.selectedPerf = e.target.value;

  }

  uniquePerforamnceArr:any = [];





    getUniquePerfromance() {
    try {
      this.artistService.getUniquePerfromance(this.artistID).subscribe({
        next: (res) => {
          this.uniquePerforamnceArr = res;
          console.log('Instruments loaded:', this.allInstruments);
        },
        error: (error:any) => {
          console.error('Error loading instruments:', error);
          this.alertService.showAlert('Internal Error', error.message, 'error');
        }
      });
    } catch (error: any) {
      // Show error alert
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }




  deletePerforamcne(id:any){
     try{
      this.artistService.deleteArtistPerfromance(id).then(()=>{
        this.artistProfile.performance_type = this.artistProfile.performance_type.filter((item: { id_ap: any; }) => item.id_ap !== id);

        this.getUniquePerfromance();
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }


    
  addPerformance(){
    let arr = {
      id_artist: this.artistID,
      id_performance: this.selectedPerf,
      created_by: this.loggedUser,
      last_updated_by: this.loggedUser   
    }

    try{
      this.artistService.addPerformance(arr).then(()=>{
          this.alertService.showAlert('Successful', 'New Perforance type is added', 'success');
        
           this.ngOnInit();

    

      })
    }catch(error:any){
       this.alertService.showAlert('Internal Error', error.message, 'error');
    }

  }


updateEdu(){

}

  
EditNewEduInfo(x:any){
 let arr = {
    course: x.course,
    school: x.school,
    year: x.year,
    last_updated: new Date(),
    last_updated_by: this.loggedUser
 }

 try{

  this.artistService.EditNewEduInfo(arr, x.id).then(()=>{
      this.alertService.showAlert('Successful', 'Education is updated', 'success');
      
      this.ngOnInit();
      this.updateDetailBtn = true;
  })

 }catch(error:any){
     this.alertService.showAlert('Internal Error', error.message, 'error');
 }

}



  delNewEduInfo(id:any){
     try{
      this.artistService.delNewEduInfo(id).then(()=>{
        this.artistProfile.education = this.artistProfile.education.filter((item: { id: any; }) => item.id !== id);
        this.alertService.showAlert('Successful', 'Education is deleted', 'success');
         this.updateDetailBtn = true;
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

addNewEdu(){

this.OpenEduForm = true;

}


newEducation:any = [];

closeForm(){
this.OpenEduForm = false;
this.OpenAwaForm = false;
this.OpenMediaVideoForm = false;
this.OpenMediaCDForm = false;
};


submitEducation(){

  let arr = {
    id_artist: this.artistID,
    course: this.newEducation.course,
    school: this.newEducation.school,
    year: this.newEducation.year,
    created_by: this.loggedUser,
    created_on: new Date(),
    last_updated: new Date(),
    last_updated_by: this.loggedUser
  }
try{
      this.artistService.addNewEdu(arr).then(()=>{
        this.ngOnInit();
        this.alertService.showAlert('Successful', 'Education is added', 'success');
        this.ngOnInit();
        this.OpenEduForm = false;
         this.updateDetailBtn = true;
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }

};
OpenEduForm:boolean = false;

clearForm(){
  this.newAward = [];
};




delNewAwardInfo(id:any){
 try{
      this.artistService.delNewAwaInfo(id).then(()=>{
        this.artistProfile.awards = this.artistProfile.awards.filter((item: { id: any; }) => item.id !== id);
        this.alertService.showAlert('Successful', 'Award is deleted', 'success');
         this.updateAwardBtn = true;
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
}

editNewAwardInfo(x:any){
     let arr = {
    award: x.award,
    description: x.description,
    year: x.year,
    last_updated: new Date(),
    last_updated_by: this.loggedUser
 }

 try{

  this.artistService.EditNewAwdInfo(arr, x.id).then(()=>{
      this.alertService.showAlert('Successful', 'Award is updated', 'success');
      
      this.ngOnInit();
      this.updateAwardBtn = true;
  })

 }catch(error:any){
     this.alertService.showAlert('Internal Error', error.message, 'error');
 }
}

addNewAward(){
this.OpenAwaForm = true;
}

newAward:any = [];

OpenAwaForm:boolean = false;

submitAward(){
  let arr = {
    id_artist: this.artistID,
    award: this.newAward.award,
    description: this.newAward.description,
    year: this.newAward.year,
    created_by: this.loggedUser,
    created_on: new Date(),
    last_updated: new Date(),
    last_updated_by: this.loggedUser
  }
try{
      this.artistService.addNewAwd(arr).then(()=>{
        this.ngOnInit();
        this.alertService.showAlert('Successful', 'Education is added', 'success');
      
        this.OpenAwaForm = false;
         this.updateDetailBtn = true;
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }

}

newMediaVideo:any = [];
OpenMediaVideoForm:boolean = false;
submitMediaVideo(arr:any){
  let dataArr = {
    id_media : 1,
    id_artist: this.artistID,
    title: arr.title,
    image: arr.image,
    description: arr.description,
    url: arr.url,
    created_by: this.loggedUser,
    created_on: new Date(),
    last_updated: new Date(),
    last_updated_by: this.loggedUser
  }

  try{
      this.artistService.addNewMediaVideo(dataArr).then(()=>{
        this.ngOnInit();
        this.alertService.showAlert('Successful', 'Education is added', 'success');
      
        this.OpenMediaVideoForm = false;
         this.updateDetailBtn = true;
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }


}
 profilePreviewUrl: string | null = null;

  async onMediaVidFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    // local preview
    this.profilePreviewUrl = URL.createObjectURL(file);

    try {
      this.newMediaVideo.image = await this.artistService.uploadPublicProfilePhoto(file);
      console.log(this.newMediaVideo);
    } catch (err) {
      console.error(err);
      alert('Failed to upload profile picture.');
    } finally {
  
    }
  }

newMediaCD:any = [];
OpenMediaCDForm:boolean = false;


 async onMediaCDFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    // local preview
    this.profilePreviewUrl = URL.createObjectURL(file);

    try {
      this.newMediaCD.image = await this.artistService.uploadPublicProfilePhoto(file);
      console.log(this.newMediaCD);
    } catch (err) {
      console.error(err);
      alert('Failed to upload profile picture.');
    } finally {
  
    }
  }

submitMediaCD(arr:any){
let dataArr = {
    id_media : 2,
    id_artist: this.artistID,
    title: arr.title,
    image: arr.image,
    description: arr.description,
    url: arr.url,
    created_by: this.loggedUser,
    created_on: new Date(),
    last_updated: new Date(),
    last_updated_by: this.loggedUser
  }

  try{
      this.artistService.addNewCDVideo(dataArr).then(()=>{
        this.ngOnInit();
        this.alertService.showAlert('Successful', 'Education is added', 'success');
      
        this.OpenMediaCDForm = false;
         this.updateDetailBtn = true;
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }

}

sendPasswordReset(){
  this.artistService.sendPasswordResetLink(this.artistProfile.email).then(()=>{
            this.alertService.showAlert('Successful', 'Reset Email Sent', 'success');

  })
  
}

activationemail(){
  try{
this.authService.resendConfirmation(this.artistProfile.email).then(()=>{
  this.alertService.showAlert('Email Sent', 'Activation email has send', 'success');
})
  }catch(error:any){
          this.alertService.showAlert('Internal Error', error.message, 'error');
  }
  

}

magicLink(){
    try{
this.authService.magicLink(this.artistProfile.email).then(()=>{
  this.alertService.showAlert('Email Sent', 'Magic link has sent', 'success');
})
  }catch(error:any){
          this.alertService.showAlert('Internal Error', error.message, 'error');
  }
}


}