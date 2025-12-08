import {
  Component,
  effect,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ArtistService } from '../../../services/artist.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { filter } from 'rxjs/operators';
import { SignInAnonymouslyCredentials } from '@supabase/supabase-js';

/**
 * Component: ArtistCreateComponent
 *
 * Purpose:
 * - Allows creation of a new artist profile using a multi-step form.
 * - Manages personal info, portfolio (instruments, videos, CDs), and achievements (education, awards).
 * - Supports file upload for profile picture and dynamic form arrays.
 * - Integrates with backend via ArtistService for real-time data operations.
 */
@Component({
  selector: 'app-artist-create',
  templateUrl: './artist-create.component.html',
  standalone: false,
})
export class ArtistCreateComponent implements OnInit {
  // Current step in the multi-step form (0 = personal, 1 = portfolio, 2 = achievements)
  stepIndex: number = 0;
  next1(){
  this.stepIndex = 2;
}

next2(){
  this.stepIndex = 3;
}

  // Main reactive form controlling the entire artist creation process
  form: FormGroup;

  // Loading state for profile picture upload
  isUploadingProfile: boolean = false;

  // Preview URL for the selected profile image (used in img src)
  profilePreviewUrl: string | null = null;

  // ID of the authenticated artist (from service)
  id_auth: any;

  // Logged-in user details (user ID, permissions, etc.)
  loggedUser: any;

  // ID of the new artist being created (assigned by host)
  artistID: any;

  /**
   * Constructor with dependency injection and reactive effect
   *
   * Initializes the form and uses Angular's `effect()` to reactively update:
   * - id_auth: Artist profile ID
   * - loggedUser: Currently logged-in user
   * - artistID: New artist ID assigned by host
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private artistService: ArtistService,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    // Reactive effect to sync component state with service observables
    effect(() => {
      this.id_auth = this.artistService.getArtistProfileID();
      this.loggedUser = this.artistService.getLoggedUserID();
      this.artistID = this.artistService.getHostNewArtistID();
    });

    // Initialize the main reactive form with nested groups and dynamic arrays
    this.form = this.fb.group({
      // Personal Information Group
      personal: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        tagline: [''],
        shortBio: [''],
        longBio: [''],
        phone: [''],
        website: [''],
        city: [''],
        address: [''],
        country: [''],
        profilePic: [''],
      }),
      // Portfolio Group
      portfolio: this.fb.group({
        instruments: this.fb.array([]),           // Selected instruments
        videos: this.fb.array([]),                // Video entries (title, url, photo)
        cds: this.fb.array([]),                   // CD entries (title, url, photo)
        performanceTypes: this.fb.array([]),     // Performance types
      }),
      // Achievements Group
      achievements: this.fb.group({
        education: this.fb.array([]),             // Education entries
        awards: this.fb.array([]),                // Award entries
      }),
    });
  }

  /**
   * Lifecycle Hook: ngOnInit
   *
   * Called once after component initialization.
   * Fetches:
   * - Artist and user IDs
   * - List of available instruments
   */
  ngOnInit(): void {
    this.id_auth = this.artistService.getArtistProfileID();
    this.loggedUser = this.artistService.getLoggedUserID();
    this.artistID = this.artistService.getHostNewArtistID();
    this.getInstrumentName();
  }

  // --- Convenience Getters for Form Access ---

  /** Getter: Access to 'personal' form group */
  get personalGroup(): FormGroup {
    return this.form.get('personal') as FormGroup;
  }

  /** Getter: Access to 'portfolio' form group */
  get portfolioGroup(): FormGroup {
    return this.form.get('portfolio') as FormGroup;
  }

  /** Getter: Access to 'achievements' form group */
  get achievementsGroup(): FormGroup {
    return this.form.get('achievements') as FormGroup;
  }

  /** Getter: Instruments FormArray */
  get instruments(): FormArray<FormControl> {
    return this.portfolioGroup.get('instruments') as FormArray<FormControl>;
  }

  /** Getter: Performance Types FormArray */
  get performanceTypes(): FormArray<FormControl> {
    return this.portfolioGroup.get('performanceTypes') as FormArray<FormControl>;
  }

  /** Getter: Videos FormArray */
  get videos(): FormArray<FormGroup> {
    return this.portfolioGroup.get('videos') as FormArray<FormGroup>;
  }

  /** Getter: CDs FormArray */
  get cds(): FormArray<FormGroup> {
    return this.portfolioGroup.get('cds') as FormArray<FormGroup>;
  }

  /** Getter: Education FormArray */
  get education(): FormArray<FormGroup> {
    return this.achievementsGroup.get('education') as FormArray<FormGroup>;
  }

  /** Getter: Awards FormArray */
  get awards(): FormArray<FormGroup> {
    return this.achievementsGroup.get('awards') as FormArray<FormGroup>;
  }

  // --- Form Array Management Methods ---

  addInstrument(value: string): void {
    const trimmed = (value || '').trim();
    if (!trimmed) return;
    this.instruments.push(new FormControl(trimmed));
  }

  addPerformanceType(value: string): void {
    const trimmed = (value || '').trim();
    if (!trimmed) return;
    this.performanceTypes.push(new FormControl(trimmed));
  }

  removePerformanceType(index: number): void {
    this.performanceTypes.removeAt(index);
  }

  addVideo(): void {
    this.videos.push(
      this.fb.group({
        title: ['', Validators.required],
        url: ['', Validators.required],
        photo: [''],
      })
    );
  }

  removeVideo(index: number): void {
    this.videos.removeAt(index);
  }

  addCd(): void {
    this.cds.push(
      this.fb.group({
        title: ['', Validators.required],
        url: ['', Validators.required],
        photo: [''],
      })
    );
  }

  removeCd(index: number): void {
    this.cds.removeAt(index);
  }

  addEducation(): void {
    this.education.push(
      this.fb.group({
        school: ['', Validators.required],
        course: ['', Validators.required],
        year: ['', Validators.required],
      })
    );
  }

  removeEducation(index: number): void {
    this.education.removeAt(index);
  }

  addAward(): void {
    this.awards.push(
      this.fb.group({
        title: ['', Validators.required],
        description: [''],
        year: ['', Validators.required],
      })
    );
  }

  removeAward(index: number): void {
    this.awards.removeAt(index);
  }

  // --- Stepper Navigation Methods ---

  next(): void {
    this.setp1();
    if (this.stepIndex < 3) this.stepIndex += 1;
  }

  back(): void {
    if (this.stepIndex > 0) this.stepIndex -= 1;
  }

  cancel(): void {
    this.router.navigate(['hosts', 'console', 'artists']);
  }

  // --- Profile Picture Upload Handler ---

  // Flag to disable "Next" button during upload
  nextBtnDisabled: boolean = false;

  async onProfileFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    this.profilePreviewUrl = URL.createObjectURL(file);
    this.isUploadingProfile = true;

    try {
      this.nextBtnDisabled = true;
      const publicUrl = await this.artistService.uploadPublicProfilePhoto(file);
      this.personalGroup.get('profilePic')?.setValue(publicUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to upload profile picture.');
    } finally {
      this.isUploadingProfile = false;
      this.nextBtnDisabled = false;
    }
  }

  // --- Instrument Management (Dropdown & API) ---

  /** List of all available instruments fetched from API */
  allInstruments: any = [];

  /**
   * Fetches list of instruments from backend.
   * On success, stores data and calls `getAllPerfromance()`.
   */
  async getInstrumentName() {
    console.log('Fetching instruments...');
    this.artistService.getInstruments().subscribe({
      next: (data: any) => {
        this.allInstruments = data;
        this.getAllPerfromance();
      },
      error: (err) => {
        console.error('Error fetching instruments:', err);
      },
    });
  }

  /**
   * Submits the form.
   * - Validates form
   * - Marks all controls as touched if invalid
   * - Logs payload (placeholder for API)
   * - Navigates on success
   */
  submit(): void {
    if (this.form.invalid) {
      this.markAllTouched(this.form);
      return;
    }

    console.log('Submitting artist payload', this.form.value);
    this.router.navigate(['hosts', 'console', 'artists']);
  }

  /**
   * Recursively marks all form controls as touched.
   * Used to trigger validation error display.
   */
  private markAllTouched(group: FormGroup | FormArray): void {
    Object.values(group.controls).forEach((control) => {
      if (control instanceof FormControl) {
        control.markAsTouched();
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllTouched(control);
      }
    });
  }

  /**
   * Step 1 submission logic.
   * - Adds loggedUser as id_auth
   * - Logs form data
   * - Calls backend API to save step 1
   */

  aFirstName:any;
  aLastName:any;
  aEmail:any;
  setp1() {
    let email = this.form.value['personal'].email;
    this.form.addControl('id_auth', new FormControl(this.loggedUser));
    const formValue = this.form.value['personal'];
    
    this.aFirstName = formValue.firstName;
    this.aLastName = formValue.lastName;
    this.aEmail = formValue.email;


    const dataX = this.artistService
      .createSingleArtist_step01(this.form.value)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        return error.message;
      });

    console.log(dataX);
  }

  // --- Selected Instruments (UI List) ---

  /** Currently selected instrument ID from dropdown */
  selectedInstrumentID: string = '0';

  /** Array of selected instruments (to display in UI) */
  selectedInstArr: any[] = [];

  onChangeInst(e: any) {
    this.selectedInstrumentID = e.target.value;
  }

  /**
   * Adds selected instrument to backend and UI.
   * - Sends payload with artist, instrument, and creator IDs
   * - Adds instrument to selected list
   * - Removes from available list
   * - Resets dropdown
   */
  addIntrumentData(): void {
    let arr = {
      id_artist: this.artistID,
      id_instrument: this.selectedInstrumentID,
      created_by: this.loggedUser,
    };
    console.log('69---69 addIntrumentData', arr);
    console.log('this is the artistID Sent', this.artistID);
    try {
      this.artistService.addInstruments(arr).then((res) => {
        let row: any = this.allInstruments.find(
          (item: any) => item.id == this.selectedInstrumentID
        );
        this.selectedInstArr.push(row);
        this.allInstruments = this.allInstruments.filter(
          (item: any) => item.id != this.selectedInstrumentID
        );
        this.selectedInstrumentID = '0';
        return res;
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  /**
   * Removes an instrument from the artist's profile.
   * - Calls backend delete
   * - Returns instrument to `allInstruments` list
   * - Sorts `allInstruments` by ID
   * - Removes from UI list
   */
  removeInstrument(id: number): void {
    let arr = {
      id_artist: this.artistID,
      id_instrument: id,
    };

    console.log('69---69 removeInstrument', arr);
    console.log('this is the artistID Sent', this.artistID);

    try {
      this.artistService
        .delInstruments(arr.id_artist, arr.id_instrument)
        .then((res) => {
          let row = this.selectedInstArr.find((item: any) => item.id == id);
          this.allInstruments.push(row);
          this.allInstruments.sort((a: any, b: any) => a.id - b.id);
          this.selectedInstArr = this.selectedInstArr.filter(
            (item) => item.id != id
          );
          this.selectedInstrumentID = '0';
          return res;
        });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  // --- Video Upload Management ---

  vidTitle: any;
  vidDesc: any;
  vidURL: any;
  vidFile: any;
  vidArr: any = [];
  loadingMediaVid: boolean = false;
  fileInputKey = 0;

  @ViewChild('fileInput') fileInput!: ElementRef;

  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.vidFile = input.files[0];
    } else {
      this.vidFile = null;
    }
  }

  // --- CD Upload Management ---

  cdTitle: any;
  cdDesc: any;
  cdURL: any;
  cdFile: any;
  cdArr: any = [];
  loadingMediaCD: boolean = false;
  fileInputKeycd = 0;

  @ViewChild('fileInputcd') fileInputcd!: ElementRef;

  onFileChangeCD(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.cdFile = input.files[0];
    } else {
      this.cdFile = null;
    }
  }

  /**
   * Uploads video media to backend.
   * On success:
   * - Adds to `vidArr`
   * - Resets form fields
   * - Clears file input
   * - Shows success alert
   */
  async uploadMedia(medType: any) {
    try {
      this.loadingMediaVid = true;
      let datax = await this.artistService
        .HostUploadArtistMedia(
          medType,
          this.artistID,
          this.vidTitle,
          this.vidFile,
          this.vidDesc,
          this.vidURL,
          this.loggedUser
        )
        .then((res) => {
          return res;
        });
      this.loadingMediaVid = false;
      console.log('datax', datax);
      let arr = {
        id: datax.id,
        title: this.vidTitle,
        url: datax.imageUrl,
      };
      this.vidArr.push(arr);

      this.vidTitle = '';
      this.vidDesc = '';
      this.vidFile = '';
      this.vidURL = '';
      this.vidFile = null;
      this.fileInput.nativeElement.value = '';
      this.alertService.showAlert('success', 'Media viedo is added', 'success');
      console.log(this.vidArr);
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  /**
   * Uploads CD media to backend.
   * Same logic as `uploadMedia`, but for CDs.
   */
  async uploadMediaCD(medType: any) {
    try {
      this.loadingMediaCD = true;
      let datax = await this.artistService
        .HostUploadArtistMedia(
          medType,
          this.artistID,
          this.cdTitle,
          this.cdFile,
          this.vidDesc,
          this.cdURL,
          this.loggedUser
        )
        .then((res) => {
          return res;
        });
      this.loadingMediaCD = false;
      console.log('datax', datax);
      let arr = {
        id: datax.id,
        title: this.cdTitle,
        url: datax.imageUrl,
      };
      this.cdArr.push(arr);

      this.cdTitle = '';
      this.cdDesc = '';
      this.cdFile = '';
      this.cdURL = '';
      this.cdFile = null;
      this.fileInputcd.nativeElement.value = '';
      this.alertService.showAlert('success', 'Media viedo is added', 'success');
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  /**
   * Deletes a video from backend and UI.
   * - Finds item by ID
   * - Filters it out from `vidArr`
   * - Shows success/error alert
   */
  async delMedia(id: any) {
    console.log('delMedia.id', id);
    let row = this.vidArr.find((item: { id: any }) => item.id == id);
    console.log('delMedia.row', row);

    this.artistService
      .deleteHostsMedia(row)
      .then(() => {
        console.log('delMedia.row.id', row.id);
        this.vidArr = this.vidArr.filter((item: { id: any }) => item.id !== row.id);
        console.log('delMedia.vidArr', this.vidArr);
        this.alertService.showAlert('Removed', 'Selected video is successfully removed', 'success');
      })
      .catch((error) => {
        this.alertService.showAlert('Internal Error', error.message, 'error');
      });
  }

  /**
   * Deletes a CD from backend and UI.
   * Same logic as `delMedia`, but for CDs.
   */
  async delMediaCD(id: any) {
    let row = this.cdArr.find((item: { id: any }) => item.id == id);

    this.artistService
      .deleteHostsMedia(row)
      .then(() => {
        this.cdArr = this.cdArr.filter((item: { id: any }) => item.id !== row.id);
        this.alertService.showAlert('Removed', 'Selected video is successfully removed', 'success');
      })
      .catch((error) => {
        this.alertService.showAlert('Internal Error', error.message, 'error');
      });
  }

  // --- Performance Type Management ---

  allPerformance: any = []; // List of all available performance types

  /**
   * Fetches all performance types from backend
   */
  async getAllPerfromance() {
    try {
      this.allPerformance = await this.artistService
        .getAllPerfromance()
        .then((res) => {
          return res;
        })
        .catch((error) => {
          this.alertService.showAlert('Internal Error', error.message, 'error');
        });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  selectedPerformanceID: any = 0;

  onChangePerf(e: any) {
    this.selectedPerformanceID = e.target.value;
  }

  selectedPerArr: any = []; // Selected performance types (UI list)

  /**
   * Adds a performance type to the artist.
   * - Sends payload to backend
   * - Moves item from `allPerformance` to `selectedPerArr`
   */
  addPerformanceData(): void {
    let arr = {
      id_artist: this.artistID,
      id_performance: this.selectedPerformanceID,
      created_by: this.loggedUser,
      updated_by: this.loggedUser,
    };

    try {
      this.artistService.addPerformance1(arr).then((res) => {
        let row: any = this.allPerformance.find(
          (item: any) => item.id == this.selectedPerformanceID
        );
        this.selectedPerArr.push(row);
        this.allPerformance = this.allPerformance.filter(
          (item: any) => item.id != this.selectedPerformanceID
        );
        this.selectedPerformanceID = '0';
        return res;
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  /**
   * Removes a performance type.
   * - Deletes from backend
   * - Returns item to `allPerformance` list
   * - Sorts list by ID
   */
  removePerformance(id: number): void {
    let arr = {
      id_artist: this.artistID,
      id_instrument: id,
    };

    try {
      this.artistService
        .delPerformance1(arr.id_artist, arr.id_instrument)
        .then((res) => {
          let row = this.selectedPerArr.find((item: any) => item.id == id);
          this.allPerformance.push(row);
          this.allPerformance.sort((a: any, b: any) => a.id - b.id);
          this.selectedPerArr = this.selectedPerArr.filter(
            (item: { id: number }) => item.id != id
          );
          this.selectedPerformanceID = '0';
          return res;
        });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  // --- Education Management ---

  eduSchool: any;
  eduCourse: any;
  eduYear: any;
  eduID: any;
  eduArr: any = [];
  loadingEducation: boolean = false;
  showEduModel: boolean = false;

  addNewEdu() {
    this.loadingEducation = true;
    let arr = {
      id_artist: this.artistID,
      course: this.eduCourse,
      school: this.eduSchool,
      year: this.eduYear,
      created_by: this.loggedUser,
      last_updated_by: this.loggedUser,
    };

    try {
      this.artistService.addNewEdu1(arr).then((res) => {
        let row = res[0];
        this.eduArr.push(row);
        console.log('this.eduArr', this.eduArr);
        this.loadingEducation = false;
        this.showEduModel = false;
        this.alertService.showAlert('Education Added', 'Data is successfully added', 'success');
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    } finally {
      this.eduSchool = '';
      this.eduCourse = '';
      this.eduYear = '';
    }
  }

  removeEdu(id: any) {
    console.log(id);
    try {
      this.artistService.delNewEduInfo(id).then(() => {
        this.eduArr = this.eduArr.filter((item: { id: any }) => item.id != id);
        this.alertService.showAlert('Education Removed', 'Data is successfully removed', 'success');
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  // --- Award Management ---

  awdAward: any;
  awdDescription: any;
  awdYear: any;
  awdID: any;
  awdArr: any = [];
  loadingAward: boolean = false;
  showAwdModel: boolean = false;

  removeAwd(id: any) {
    try {
      this.artistService.delNewAwaInfo(id).then(() => {
        this.awdArr = this.awdArr.filter((item: { id: any }) => item.id != id);
        this.alertService.showAlert('Education Removed', 'Data is successfully removed', 'success');
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  addNewAward() {
    this.loadingEducation = true;
    let arr = {
      id_artist: this.artistID,
      award: this.awdAward,
      description: this.awdDescription,
      year: this.awdYear,
      created_by: this.loggedUser,
      last_updated_by: this.loggedUser,
    };

    try {
      this.artistService.addNewAwd1(arr).then((res) => {
        let row = res[0];
        this.awdArr.push(row);
        console.log('this.eduArr', this.awdArr);
        this.loadingAward = false;
        this.showAwdModel = false;
        this.alertService.showAlert('Award Added', 'Data is successfully added', 'success');
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    } finally {
      this.awdAward = '';
      this.awdDescription = '';
      this.awdYear = '';
    }
  }

  gotToArtistList(){
    this.router.navigate(['hosts/console/artists'])
  }
}