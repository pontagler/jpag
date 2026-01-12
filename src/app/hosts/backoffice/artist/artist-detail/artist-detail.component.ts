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
  // Requirement section state
  reqShowEdit: boolean = false;
  artistRequirement: any = [];
  reqFormData: {
    ribNumber: string;
    gusoNumber: string;
    securityNumber: string;
    alergies: string;
    foodRestriction: string;
    requirements: string;
  } = {
    ribNumber: '',
    gusoNumber: '',
    securityNumber: '',
    alergies: '',
    foodRestriction: '',
    requirements: ''
  };
  // Time-off section state
  timeoffShowEdit: boolean = true;
  startDate: string = '';
  endDate: string = '';
  note: string = '';
  editingIndex: number | null = null;
  timeoffEntries: Array<{
    id?: number;
    startDate: string;
    endDate: string;
    days: number;
    note?: string;
  }> = [];
  // Form properties
  instruments: any = [];                   // Instruments array
  changeSystem: boolean = true;            // System settings edit state
  activeArtist: any;                       // Artist active status
  featureArtist: any;                      // Featured artist status
  updateDetailBtn: boolean = true;         // Update detail button state
  allInstruments: any = [];                 // All instruments array
  updateAwardBtn:boolean = true;
  // Profile image upload state
  isUploadingProfile: boolean = false;
  // Email authentication status
  isEmailAuthenticated: boolean = false;
  performance_type:any = [];
  media_video:any = [];
  media_cd:any = [];
  media:any = [];
  education:any = [];
  awards:any = [];
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
        const profile = await this.artistService.getArtistProfile_v3(this.artistID);
        console.log('------------>:', profile);
        // Check if profile data exists
        if (!profile || profile.length === 0) {
          this.error = 'Artist profile not found';
          this.loading = false;
          return;
        }
        
        this.artistProfile = profile.artist;
        this.education = profile.education || [];
        this.awards = profile.awards || [];
        this.instruments = profile?.instruments || [];
        this.selectedInstArray = this.instruments;
        this.featureArtist = profile.artist?.is_featured || false;
        this.activeArtist = profile.artist?.is_active || false;
        this.performance_type = profile?.performance_type || [];
        this.media = profile?.media || [];
        this.media_video = this.media.filter((item: { id_media: any; }) => item.id_media !== 2);
        this.media_cd = this.media.filter((item: { id_media: any; }) => item.id_media !== 1);

        // Check email authentication status
        await this.checkEmailAuthenticationStatus();



       
        console.log('Artist Profile loaded:', this.artistProfile);
        console.log('Instruments:', this.instruments);
        this.loading = false;
        // Load requirement section data
        await this.loadArtistRequirement();
        // Load time-off section data
        await this.loadArtistTimeOff();
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

  async loadArtistRequirement(): Promise<void> {
    if (!this.artistID) return;
    try {
      const data = await this.artistService.getArtistRequirement(this.artistID);
      this.artistRequirement = data || [];
      if (Array.isArray(data) && data.length > 0) {
        const row = data[0];
        this.reqFormData = {
          ribNumber: row?.rib || '',
          gusoNumber: row?.guso_nb || '',
          securityNumber: row?.security_nb || '',
          alergies: row?.arlergies || '',
          foodRestriction: row?.food_restriction || '',
          requirements: row?.requirement || ''
        };
      }
    } catch (e) {
      console.error('Failed to load artist requirement', e);
    }
  }

  async loadArtistTimeOff(): Promise<void> {
    if (!this.artistID) return;
    try {
      const data = await this.artistService.getArtistTimeOff(this.artistID);
      this.timeoffEntries = (data || []).map((row: any) => ({
        id: row.id,
        startDate: row.start_date,
        endDate: row.end_date,
        days: this.calculateInclusiveDays(row.start_date, row.end_date),
        note: row.notes || ''
      }));
    } catch (e) {
      console.error('Failed to load timeoff', e);
    }
  }

  async onReqSubmit(): Promise<void> {
    if (!this.artistID) return;
    const payload: any = {
      id_artist: this.artistID,
      rib: this.reqFormData.ribNumber || null,
      guso_nb: this.reqFormData.gusoNumber || null,
      security_nb: this.reqFormData.securityNumber || null,
      arlergies: this.reqFormData.alergies || null,
      food_restriction: this.reqFormData.foodRestriction || null,
      requirement: this.reqFormData.requirements || null
    };

    try {
      if (!Array.isArray(this.artistRequirement) || this.artistRequirement.length === 0) {
        await this.artistService.addArtistRequirement({
          ...payload,
          created_by: this.loggedUser
        });
      } else {
        const existing = this.artistRequirement[0];
        await this.artistService.editArtistRequirement({
          ...payload,
          updated_by: this.loggedUser,
          last_updated: new Date().toISOString()
        }, existing.id);
      }

      await this.loadArtistRequirement();
      this.reqShowEdit = false;
      this.alertService.showAlert('Successful', 'Requirements saved', 'success');
    } catch (e: any) {
      console.error('Failed to save artist requirement', e);
      this.alertService.showAlert('Internal Error', e?.message || 'Failed to save', 'error');
    }
  }

  maskRib(value: string | null | undefined): string {
    if (!value) return '-';
    const str = String(value);
    if (str.length <= 4) return str;
    const last4 = str.slice(-4);
    return 'x'.repeat(str.length - 4) + last4;
  }

  get computedDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffMs = end.setHours(0,0,0,0) - start.setHours(0,0,0,0);
    if (diffMs < 0) return 0;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  private calculateInclusiveDays(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diffMs = e.setHours(0,0,0,0) - s.setHours(0,0,0,0);
    if (diffMs < 0) return 0;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  resetTimeoffForm(): void {
    this.startDate = '';
    this.endDate = '';
    this.note = '';
    this.editingIndex = null;
  }

  addOrUpdateTimeoff(): void {
    if (!this.startDate || !this.endDate) return;
    const days = this.computedDays;
    if (days <= 0) return;
    if (this.editingIndex !== null) {
      this.updateTimeoffEntry(this.editingIndex);
    } else {
      this.addTimeoffEntry();
    }
  }

  private async addTimeoffEntry(): Promise<void> {
    if (!this.artistID) return;
    const payload: any = {
      id_artist: this.artistID,
      start_date: this.startDate,
      end_date: this.endDate,
      notes: this.note?.trim() || null,
      created_by: this.loggedUser
    };
    try {
      await this.artistService.addArtistTimeOff(payload);
      await this.loadArtistTimeOff();
      this.resetTimeoffForm();
      this.timeoffShowEdit = false;
      this.alertService.showAlert('Successful', 'Time off added', 'success');
    } catch (e: any) {
      console.error('Failed to add timeoff', e);
      this.alertService.showAlert('Internal Error', e?.message || 'Failed to add', 'error');
    }
  }

  private async updateTimeoffEntry(index: number): Promise<void> {
    if (!this.artistID) return;
    const target = this.timeoffEntries[index];
    if (!target || target.id == null) return;
    const payload: any = {
      id_artist: this.artistID,
      start_date: this.startDate,
      end_date: this.endDate,
      notes: this.note?.trim() || null,
      updated_by: this.loggedUser,
      last_updated: new Date().toISOString()
    };
    try {
      await this.artistService.editArtistTimeOff(payload, target.id);
      await this.loadArtistTimeOff();
      this.resetTimeoffForm();
      this.timeoffShowEdit = false;
      this.alertService.showAlert('Successful', 'Time off updated', 'success');
    } catch (e: any) {
      console.error('Failed to update timeoff', e);
      this.alertService.showAlert('Internal Error', e?.message || 'Failed to update', 'error');
    }
  }

  editTimeoff(index: number): void {
    const item = this.timeoffEntries[index];
    if (!item) return;
    this.startDate = item.startDate;
    this.endDate = item.endDate;
    this.note = item.note || '';
    this.editingIndex = index;
    this.timeoffShowEdit = true;
  }

  async deleteTimeoff(index: number): Promise<void> {
    const item = this.timeoffEntries[index];
    if (!item) return;
    if (item.id == null) {
      this.timeoffEntries.splice(index, 1);
      return;
    }
    try {
      await this.artistService.deleteArtistTimeOff(item.id);
      await this.loadArtistTimeOff();
      if (this.editingIndex === index) {
        this.resetTimeoffForm();
      }
      this.alertService.showAlert('Successful', 'Time off deleted', 'success');
    } catch (e: any) {
      console.error('Failed to delete timeoff', e);
      this.alertService.showAlert('Internal Error', e?.message || 'Failed to delete', 'error');
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
  
    
  }

  goToURL(id: any): void {
    if (!id || typeof id !== 'string') {
      console.warn('Invalid URL provided:', id);
      return;
    }
  
    let url = id.trim();
    try {
      // Try to parse as URL (handles most cases)
      const urlObj = new URL(url);
      url = urlObj.toString();
    } catch {
      // If it fails, assume it's a domain and prepend https://
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
    }
  
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      alert('Popup blocked. Please allow popups for this site.');
    }
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
      is_active: this.activeArtist ? true : false,
      is_featured: this.featureArtist ? true : false,
      last_update: new Date(),
      updated_by: this.loggedUser
    };

    console.log('Updating system settings:', arr);

    try {
      // Call service to update artist status
      this.artistService.updateArtistStatus(arr, this.artistID).then(() => {
        this.alertService.showAlert('Success', 'System settings updated successfully', 'success');
        this.changeSystem = true; // Exit edit mode
      }).catch((error) => {
        console.error('Error updating system settings:', error);
        this.alertService.showAlert('Error', 'Failed to update system settings', 'error');
      });
    } catch (error) {
      console.error('Error updating system settings:', error);
      this.alertService.showAlert('Error', 'Failed to update system settings', 'error');
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
  async updateDetail(): Promise<void> {
    // Store original email for comparison
    const originalEmail = this.artistProfile.email;
    const newEmail = this.artistProfile.email?.trim() || '';

    // Validate email if provided
    if (newEmail && !this.isValidEmail(newEmail)) {
      this.alertService.showAlert('Validation Error', 'Please enter a valid email address', 'error');
      return;
    }

    // Prepare detail update payload
    let arr = {
      fname: this.artistProfile.fname,
      lname: this.artistProfile.lname,
      phone: this.artistProfile.phone,
      email: newEmail,
      teaser: this.artistProfile.teaser,
      website: this.artistProfile.website,
      city: this.artistProfile.city,
      address: this.artistProfile.address,
      country: this.artistProfile.country,
      photo: this.artistProfile.photo,
      short_bio: this.artistProfile.short_bio,
      long_bio: this.artistProfile.long_bio,
      last_update: new Date(),
      updated_by: this.loggedUser
    };

    try {
      // Update artist details in database
      await this.artistService.updateArtistDetail(arr, this.artistID);

      // Check if email was changed/added
      const existingUserId = this.artistProfile.id_user || this.artistProfile.id_profile;
      const emailChanged = originalEmail !== newEmail;
      const emailAdded = (!originalEmail || originalEmail.trim() === '') && newEmail && newEmail.trim() !== '';

      console.log('Email update check:', {
        existingUserId,
        originalEmail,
        newEmail,
        emailChanged,
        emailAdded,
        artistProfile: this.artistProfile
      });

      if ((emailChanged || emailAdded) && newEmail) {
        try {
          let authUserId: string;

          if (existingUserId) {
            // User exists, check if email is missing and fix it
            console.log('Checking existing auth user:', existingUserId);
            const { data: existingUserData, error: getUserError } = await this.artistService.getAuthUserById(existingUserId);
            
            if (getUserError) {
              console.error('Error fetching existing user:', getUserError);
              throw new Error(`Failed to fetch existing user: ${getUserError.message}`);
            }

            const existingEmail = existingUserData?.user?.email?.trim() || '';
            const normalizedNewEmail = newEmail.trim().toLowerCase();

            if (!existingEmail || existingEmail.toLowerCase() !== normalizedNewEmail) {
              // Email is missing or different, update it
              console.log('Updating existing auth user email. Current:', existingEmail, 'New:', normalizedNewEmail);
              const updateResult = await this.artistService.updateAuthUserEmail(existingUserId, normalizedNewEmail);
              authUserId = updateResult.user.id;
              
              // Verify email was set
              const { data: verifyData } = await this.artistService.getAuthUserById(authUserId);
              if (!verifyData?.user?.email || verifyData.user.email.trim().toLowerCase() !== normalizedNewEmail) {
                // Email still missing, try to fix it
                console.warn('Email not set correctly after update, attempting fix...');
                await this.artistService.fixMissingEmail(authUserId, normalizedNewEmail);
              }
              
              console.log('Auth email updated, userId:', authUserId);
            } else {
              authUserId = existingUserId;
              console.log('Email already set correctly in auth.users');
            }
          } else {
            // No user exists, create new one
            console.log('Creating new auth user for email:', newEmail);
            authUserId = await this.artistService.createOrUpdateAuthUser(
              newEmail,
              this.artistProfile.fname,
              this.artistProfile.lname
            );
            console.log('New auth user created, userId:', authUserId);
            
            // Verify email was set
            const { data: verifyData } = await this.artistService.getAuthUserById(authUserId);
            if (!verifyData?.user?.email) {
              // Email missing, try to fix it
              console.warn('Email not set after creation, attempting fix...');
              await this.artistService.fixMissingEmail(authUserId, newEmail);
            }
          }

          // Step 2: Create or update user_profile with id_role = 3
          console.log('Creating/updating user_profile...');
          await this.artistService.createOrUpdateUserProfile(
            authUserId,
            {
              fname: this.artistProfile.fname,
              lname: this.artistProfile.lname,
              email: newEmail,
              phone: this.artistProfile.phone,
              city: this.artistProfile.city,
              proviance: this.artistProfile.proviance,
              country: this.artistProfile.country
            },
            this.loggedUser
          );

          // Step 3: Update artists.id_profile with auth user ID
          console.log('Updating artists.id_profile...');
          await this.artistService.updateArtistDetail(
            { id_profile: authUserId, updated_by: this.loggedUser },
            this.artistID
          );

          // Step 4: Send activation email
          try {
            await this.authService.resendConfirmation(newEmail);
            console.log('Activation email sent via resendConfirmation');
          } catch (resendError: any) {
            console.warn('Resend confirmation failed, trying password reset:', resendError);
            try {
              await this.artistService.sendPasswordResetLink(newEmail);
              console.log('Password reset link sent as fallback');
            } catch (resetError: any) {
              console.warn('Password reset also failed:', resetError);
            }
          }

          // Refresh profile to get updated data
          await this.ngOnInit();
          
          // Refresh email authentication status
          await this.checkEmailAuthenticationStatus();

          this.alertService.showAlert(
            'Success',
            `Artist profile updated. Auth account created/updated. Activation email sent to ${newEmail}. The artist can use this link to activate their account and set a password.`,
            'success'
          );
        } catch (authError: any) {
          console.error('Error in email/auth flow:', authError);
          this.alertService.showAlert(
            'Partial Success',
            `Profile updated, but failed to complete authentication setup: ${authError.message || 'Unknown error'}. Please try again or contact support.`,
            'warning'
          );
        }
      } else {
        // No email change or no email provided
        this.alertService.showAlert('Successful', 'Artist profile is updated', 'success');
      }

      this.updateDetailBtn = true; // Exit edit mode
    } catch (error: any) {
      // Show error alert
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  /**
   * Validates email format
   * @param email - Email string to validate
   * @returns boolean indicating if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Change profile picture handler
  async onProfileImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file || !this.artistID || !this.artistProfile) return;

    this.isUploadingProfile = true;
    try {
      const newUrl = await this.artistService.replaceArtistPhoto(
        this.artistID,
        this.loggedUser,
        this.artistProfile.photo || null,
        file
      );
      this.artistProfile.photo = newUrl;
      this.alertService.showAlert('Profile Updated', 'Profile picture changed successfully', 'success');
      this.updateDetailBtn = true;
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message || 'Failed to update photo', 'error');
    } finally {
      this.isUploadingProfile = false;
      input.value = '';
    }
  }

  // Change profile picture handler
  async onCoverImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file || !this.artistID || !this.artistProfile) return;

    this.isUploadingProfile = true;
    try {
      const newUrl = await this.artistService.replaceArtistCover(
        this.artistID,
        this.loggedUser,
        this.artistProfile.cover || null,
        file
      );
      this.artistProfile.cover = newUrl;
      this.alertService.showAlert('Cover Updated', 'Cover picture changed successfully', 'success');
      this.updateDetailBtn = true;
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message || 'Failed to update photo', 'error');
    } finally {
      this.isUploadingProfile = false;
      input.value = '';
    }
  }



  // Get instruments for artist update
  getInstruments() {
   
    try {
      this.artistService.getInstruments().subscribe({
        next: (instruments) => {
          this.allInstruments = instruments;
        //  console.log('Instruments loaded:', this.allInstruments);
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
        this.media_video = this.media_video.filter((item: { id: any; }) => item.id !== id);
      
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  // Delete artist cd
  deleteMediacd(id:any){
    try{
      this.artistService.deleteArtistMedia(id).then(()=>{
        this.media_cd = this.media_cd.filter((item: { id: any; }) => item.id !== id);

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
      console.log('----1/1 getUniquePerfromance--------->:', this.artistID);
    try {
      console.log('---1/2 CALLING SERVICE getUniquePerfromance_v1--------->:');
      this.artistService.getUniquePerfromance_v1(this.artistID).subscribe({
        next: (res) => {
       
          this.uniquePerforamnceArr = res;
          console.log('1/4 RECEIVED DATA FROM SERVICE getUniquePerfromance_v1:', res);
        },
        error: (error:any) => {
          console.log('1/5 RECEIVED ERROR FROM SERVICE getUniquePerfromance_v1:', error);
          this.alertService.showAlert('Internal Error', error.message, 'error');
        }
      });
    } catch (error: any) {
      // Show error alert
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }




  deletePerforamcne(id:any){
    let param  = { 
      id_artist: this.artistID,
      id_performance: id,
    }
     try{
      this.artistService.deleteArtistPerfromance_v1(param).then(()=>{
        console.log('---deleteArtistPerfromance--------->:', param);

        this.performance_type = this.performance_type.filter((item: { id: any; }) => item.id !== id);

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
      updated_by: this.loggedUser   
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
        this.education = this.education.filter((item: { id: any; }) => item.id !== id);
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
    created_on: new Date().toISOString(),
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
        this.awards = this.awards.filter((item: { id: any; }) => item.id !== id);
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
    last_update: new Date(),
    updated_by: this.loggedUser
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
    last_update: new Date(),
    updated_by: this.loggedUser
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

  /**
   * Checks if the artist's email is authenticated
   */
  async checkEmailAuthenticationStatus(): Promise<void> {
    try {
      const userId = this.artistProfile?.id_user || this.artistProfile?.id_profile;
      if (!userId || !this.artistProfile?.email) {
        this.isEmailAuthenticated = false;
        return;
      }

      // Get user from auth.users to check email_confirmed_at
      const { data: userData, error } = await this.artistService.getAuthUserById(userId);
      
      if (error || !userData) {
        console.warn('Could not check email authentication status:', error);
        this.isEmailAuthenticated = false;
        return;
      }

      // Email is authenticated if email_confirmed_at is not null
      this.isEmailAuthenticated = !!userData.user?.email_confirmed_at;
      console.log('Email authentication status:', {
        email: userData.user?.email,
        isAuthenticated: this.isEmailAuthenticated,
        confirmedAt: userData.user?.email_confirmed_at
      });
    } catch (error: any) {
      console.error('Error checking email authentication:', error);
      this.isEmailAuthenticated = false;
    }
  }

  /**
   * Sends reactivation email to the artist
   */
  async activationemail(): Promise<void> {
    if (!this.artistProfile?.email) {
      this.alertService.showAlert('Error', 'No email address found for this artist', 'error');
      return;
    }

    if (this.isEmailAuthenticated) {
      this.alertService.showAlert('Info', 'Email is already authenticated. No reactivation needed.', 'info');
      return;
    }

    try {
      await this.authService.resendConfirmation(this.artistProfile.email);
      this.alertService.showAlert('Email Sent', 'Activation email has been sent', 'success');
    } catch (error: any) {
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

/**
 * Deletes the artist profile and associated auth user
 * Requires confirmation before proceeding with SweetAlert2
 */
async deleteArtistProfile(): Promise<void> {
  if (!this.artistID || !this.artistProfile) {
    this.alertService.showAlert('Error', 'Artist information not available', 'error');
    return;
  }

  // SweetAlert2 confirmation dialog
  const artistName = `${this.artistProfile.fname} ${this.artistProfile.lname}`;
  const confirmed = await this.alertService.confirmDelete(
    'Delete Artist?',
    `Are you sure you want to permanently delete ${artistName}? This action cannot be undone and will remove all associated data.`,
    'Yes, delete permanently'
  );

  if (!confirmed) {
    return;
  }

  try {
    // Get the user ID for auth deletion
    const userId = this.artistProfile.id_user || this.artistProfile.id_profile;
    
    if (!userId) {
      this.alertService.showAlert('Error', 'User ID not found', 'error');
      return;
    }

    // First delete the artist using the PostgreSQL function
    await this.artistService.deleteArtist(this.artistID);
    
    // Then delete from auth.users
    await this.artistService.deleteAuthUser(userId);
    
    this.alertService.showAlert('Success', 'Artist deleted successfully', 'success');
    
    // Navigate back to artist list after a short delay
    setTimeout(() => {
      window.history.back();
    }, 1500);
    
  } catch (error: any) {
    console.error('Error deleting artist:', error);
    this.alertService.showAlert('Error', error.message || 'Failed to delete artist', 'error');
  }
}


}