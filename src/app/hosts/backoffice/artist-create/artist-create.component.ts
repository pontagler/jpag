import { Component, effect, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-artist-create',
  templateUrl: './artist-create.component.html',
  standalone: false,
  
})
export class ArtistCreateComponent implements OnInit {
  stepIndex: number = 1;

  form: FormGroup;
  isUploadingProfile: boolean = false;
  profilePreviewUrl: string | null = null;
  id_auth: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private artistService: ArtistService,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    effect(() => {
      this.id_auth = this.artistService.getArtistProfileID();
    });




    this.form = this.fb.group({
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
        province: [''],
        country: [''],
        profilePic: [''],
      }),
      portfolio: this.fb.group({
        instruments: this.fb.array([]),
        videos: this.fb.array([
          // empty by default
        ]),
        cds: this.fb.array([
          // empty by default
        ]),
        performanceTypes: this.fb.array([]),
      }),
      achievements: this.fb.group({
        education: this.fb.array([
          // { school, course, year }
        ]),
        awards: this.fb.array([
          // { title, description, year }
        ]),
      }),
    });
  }

  ngOnInit(): void {
    this.id_auth = this.artistService.getArtistProfileID();
    this.getInstrumentName();
  }
  // Convenience getters
  get personalGroup(): FormGroup {
    return this.form.get('personal') as FormGroup;
  }
  get portfolioGroup(): FormGroup {
    return this.form.get('portfolio') as FormGroup;
  }
  get achievementsGroup(): FormGroup {
    return this.form.get('achievements') as FormGroup;
  }

  get instruments(): FormArray<FormControl> {
    return this.portfolioGroup.get('instruments') as FormArray<FormControl>;
  }
  get performanceTypes(): FormArray<FormControl> {
    return this.portfolioGroup.get(
      'performanceTypes'
    ) as FormArray<FormControl>;
  }
  get videos(): FormArray<FormGroup> {
    return this.portfolioGroup.get('videos') as FormArray<FormGroup>;
  }
  get cds(): FormArray<FormGroup> {
    return this.portfolioGroup.get('cds') as FormArray<FormGroup>;
  }
  get education(): FormArray<FormGroup> {
    return this.achievementsGroup.get('education') as FormArray<FormGroup>;
  }
  get awards(): FormArray<FormGroup> {
    return this.achievementsGroup.get('awards') as FormArray<FormGroup>;
  }

  // Adders
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

  // Stepper controls
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

  async onProfileFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    // local preview
    this.profilePreviewUrl = URL.createObjectURL(file);
    this.isUploadingProfile = true;
    try {
      const publicUrl = await this.artistService.uploadPublicProfilePhoto(file);
      this.personalGroup.get('profilePic')?.setValue(publicUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to upload profile picture.');
    } finally {
      this.isUploadingProfile = false;
    }
  }

  allInstruments: any = [];

  async getInstrumentName() {
    console.log('Fetching instruments...');
    this.artistService.getInstruments().subscribe({
      next: (data: any) => {
        this.allInstruments = data;
        console.log('Fetched instruments:', this.allInstruments);
      },
      error: (err) => {
        console.error('Error fetching instruments:', err);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.markAllTouched(this.form);
      return;
    }
    // TODO: hook to API service
    console.log('Submitting artist payload', this.form.value);
    this.router.navigate(['hosts', 'console', 'artists']);
  }

  private markAllTouched(group: FormGroup | FormArray): void {
    Object.values(group.controls).forEach((control) => {
      if (control instanceof FormControl) {
        control.markAsTouched();
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllTouched(control);
      }
    });
  }

  setp1() {
    let email = this.form.value['personal'].email;

    this.form.addControl('id_auth', new FormControl(this.id_auth));

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

  selectedInstrumentID: string = '0';
  selectedInstArr: any[] = [];  // Your selected instruments array


  onChangeInst(e: any) {
    this.selectedInstrumentID = e.target.value;
  }



  addIntrumentData(): void {
    let arr = {
      id_artist: '507e574a-dc95-432d-abae-38091cc52b97',
      id_instrument: this.selectedInstrumentID,
      created_by: '507e574a-dc95-432d-abae-38091cc52b97'
    }

    try {
      this.artistService.addInstruments(arr).then((res) => {
        let row: any = this.allInstruments.find((item: any) => item.id == this.selectedInstrumentID);
        this.selectedInstArr.push(row);
        this.selectedInstrumentID = '0';
        return res;
      })
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }



  removeInstrument(id: number): void {
    let arr = {
      id_artist: '507e574a-dc95-432d-abae-38091cc52b97',
      id_instrument: id
    };
  
    try {
      this.artistService.delInstruments(arr.id_artist, arr.id_instrument).then((res) => {
        this.selectedInstArr = this.selectedInstArr.filter(item => item.id !== id);
        this.selectedInstrumentID = '0';  // Reset selected ID as well
        return res;
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }


}
