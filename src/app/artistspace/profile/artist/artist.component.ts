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
tempCover:any = 'https://pekaexfrnhysdntbyqbl.supabase.co/storage/v1/object/public/artistrequest/istockphoto-821760914-612x612.jpg';

// Name & Tagline editing state
nameEdit: boolean = false;
nameClick: boolean = false;

// Performance editing state
perfEdit: boolean = false;
allPerformance: any[] = [];
availablePerformance: any[] = [];
selectedPerformanceID: string = '0';

// Education & awards editing state
eduEdit: boolean = false;
awaEdit: boolean = false;
newEducation: any = { school: '', course: '', year: '' };
newAward: any = { award: '', description: '', year: '' };

// Modal state for Education add
OpenEduForm: boolean = false;
// Modal state for Awards add
OpenAwaForm: boolean = false;

// Photo/Cover upload state
photoUploading: boolean = false;
coverUploading: boolean = false;

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

async updateNameTagline(){
  this.nameClick = true;
  await this.artistService.updateInfo(
    this.artistID,
    this.authID,
    this.artistProfile.fname,
    this.artistProfile.lname,
    this.artistProfile.tagline
  ).then(()=>{
    this.alertService.showAlert('Updated', 'Name & tagline updated', 'success');
    this.nameEdit = false;
    this.nameClick = false;
  }).catch((error:any)=>{
    this.alertService.showAlert('Error', error?.message || error, 'error');
    this.nameClick = false;
  })
}

// Replace/Upload profile photo
async onSelectPhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files && input.files.length > 0 ? input.files[0] : null;
  if (!file) return;
  this.photoUploading = true;
  try {
    const oldUrl = this.artistProfile?.photo || null;
    const newUrl = await this.artistService.replaceArtistPhoto(this.artistID, this.authID, oldUrl, file);
    if (newUrl) {
      this.artistProfile.photo = newUrl;
    }
    this.alertService.showAlert('Updated', 'Profile photo updated', 'success');
  } catch (err: any) {
    this.alertService.showAlert('Error', err?.message || 'Failed to update profile photo', 'error');
  } finally {
    this.photoUploading = false;
    if (input) input.value = '';
  }
}

// Replace/Upload cover image
async onSelectCover(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files && input.files.length > 0 ? input.files[0] : null;
  if (!file) return;
  this.coverUploading = true;
  try {
    const oldUrl = this.artistProfile?.cover || null;
    const newUrl = await this.artistService.replaceArtistCover(this.artistID, this.authID, oldUrl, file);
    if (newUrl) {
      this.artistProfile.cover = newUrl;
    }
    this.alertService.showAlert('Updated', 'Cover image updated', 'success');
  } catch (err: any) {
    this.alertService.showAlert('Error', err?.message || 'Failed to update cover image', 'error');
  } finally {
    this.coverUploading = false;
    if (input) input.value = '';
  }
}

// --- Performance editing helpers ---
onTogglePerfEdit() {
  this.perfEdit = !this.perfEdit;
  if (this.perfEdit) {
    this.loadAllPerformance();
  }
}

private computeAvailablePerformance(): void {
  const current = (this.artistProfile?.performance_type || []).map((p: any) => (
    (p?.performance_type || p?.performance || '') + ''
  ).toLowerCase());
  this.availablePerformance = (this.allPerformance || []).filter((sys: any) => !current.includes((sys?.name || '').toLowerCase()));
}

async loadAllPerformance() {
  try {
    this.allPerformance = await this.artistService.getAllPerfromance();
    this.computeAvailablePerformance();
  } catch (err) {
    // no-op
  }
}

onChangePerf(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  this.selectedPerformanceID = selectElement?.value ?? '0';
}

addPerformanceData(): void {
  const id = this.selectedPerformanceID;
  if (!id || id === '0') return;
  const payload = {
    id_artist: this.artistID,
    id_performance: id,
    created_by: this.authID,
    last_updated_by: this.authID
  };
  try {
    this.artistService.addPerformance1(payload).then(() => {
      const row = (this.allPerformance || []).find((x: any) => (x?.id + '') === (id + ''));
      if (row) {
        const newItem = { performance_type: row.name, id_performance: row.id };
        const list = Array.isArray(this.artistProfile?.performance_type) ? this.artistProfile.performance_type : [];
        list.push(newItem);
        this.artistProfile.performance_type = list;
      }
      this.selectedPerformanceID = '0';
      this.computeAvailablePerformance();
    });
  } catch (error) {
    // no-op
  }
}

removePerformance(perf: any): void {
  try {
    const perfId = perf?.id_performance ?? perf?.id ?? null;
    if (!perfId) return;
    this.artistService.delPerformance1(this.artistID, perfId).then(() => {
      const current = Array.isArray(this.artistProfile?.performance_type) ? this.artistProfile.performance_type : [];
      this.artistProfile.performance_type = current.filter((p: any) => {
        const pid = p?.id_performance ?? p?.id ?? null;
        return (pid + '') !== (perfId + '');
      });

      // Return to available list if missing
      const exists = (this.availablePerformance || []).some((x: any) => (x?.id + '') === (perfId + ''));
      if (!exists) {
        const sys = (this.allPerformance || []).find((x: any) => (x?.id + '') === (perfId + ''));
        if (sys) this.availablePerformance.push(sys);
      }
      this.selectedPerformanceID = '0';
      this.computeAvailablePerformance();
    });
  } catch (error) {
    // no-op
  }
}

// --- Education editing helpers ---
onToggleEduEdit() {
  this.eduEdit = !this.eduEdit;
}

openEduForm() {
  this.OpenEduForm = true;
}

closeEduForm() {
  this.OpenEduForm = false;
}

clearEduForm() {
  this.newEducation = { school: '', course: '', year: '' };
}

addEducation(): void {
  const school = (this.newEducation.school || '').trim();
  const course = (this.newEducation.course || '').trim();
  const year = (this.newEducation.year || '').trim();
  if (!school || !course || !year) return;
  const payload = {
    id_artist: this.artistID,
    school,
    course,
    year,
    created_by: this.authID,
    last_updated_by: this.authID
  };
  try {
    this.artistService.addNewEdu1(payload).then((res: any) => {
      const row = Array.isArray(res) ? res[0] : res;
      const item = row && row.id ? row : { id: row?.id || Math.random(), school, course, year };
      const list = Array.isArray(this.artistProfile?.education) ? this.artistProfile.education : [];
      list.push(item);
      this.artistProfile.education = list;
      this.newEducation = { school: '', course: '', year: '' };
      this.OpenEduForm = false;
      this.alertService.showAlert('Successful', 'Education added', 'success');
    }).catch((error: any) => {
      this.alertService.showAlert('Internal Error', error?.message || 'Failed to add education', 'error');
    });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error?.message || 'Failed to add education', 'error');
  }
}

updateEducation(item: any): void {
  if (!item?.id) return;
  const payload = {
    school: item.school,
    course: item.course,
    year: item.year,
    last_updated_by: this.authID
  };
  try {
    this.artistService.EditNewEduInfo(payload, item.id).then(() => {
      this.alertService.showAlert('Updated', 'Education updated', 'success');
    }).catch((error: any) => {
      this.alertService.showAlert('Internal Error', error?.message || 'Failed to update education', 'error');
    });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error?.message || 'Failed to update education', 'error');
  }
}

removeEducation(item: any): void {
  const id = item?.id;
  if (!id) return;
  try {
    this.artistService.delNewEduInfo(id).then(() => {
      const list = Array.isArray(this.artistProfile?.education) ? this.artistProfile.education : [];
      this.artistProfile.education = list.filter((x: any) => x.id !== id);
      this.alertService.showAlert('Successful', 'Education removed', 'success');
    }).catch((error: any) => {
      this.alertService.showAlert('Internal Error', error?.message || 'Failed to remove education', 'error');
    });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error?.message || 'Failed to remove education', 'error');
  }
}

// --- Awards editing helpers ---
onToggleAwaEdit() {
  this.awaEdit = !this.awaEdit;
}

openAwaForm() {
  this.OpenAwaForm = true;
}

closeAwaForm() {
  this.OpenAwaForm = false;
}

clearAwaForm() {
  this.newAward = { award: '', description: '', year: '' };
}

addAward(): void {
  const award = (this.newAward.award || '').trim();
  const description = (this.newAward.description || '').trim();
  const year = (this.newAward.year || '').trim();
  if (!award || !description || !year) return;
  const payload = {
    id_artist: this.artistID,
    award,
    description,
    year,
    created_by: this.authID,
    last_updated_by: this.authID
  };
  try {
    this.artistService.addNewAwd1(payload).then((res: any) => {
      const row = Array.isArray(res) ? res[0] : res;
      const item = row && row.id ? row : { id: row?.id || Math.random(), award, description, year };
      const list = Array.isArray(this.artistProfile?.awards) ? this.artistProfile.awards : [];
      list.push(item);
      this.artistProfile.awards = list;
      this.newAward = { award: '', description: '', year: '' };
      this.OpenAwaForm = false;
      this.alertService.showAlert('Successful', 'Award added', 'success');
    }).catch((error: any) => {
      this.alertService.showAlert('Internal Error', error?.message || 'Failed to add award', 'error');
    });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error?.message || 'Failed to add award', 'error');
  }
}

updateAward(item: any): void {
  if (!item?.id) return;
  const payload = {
    award: item.award,
    description: item.description,
    year: item.year,
    last_updated_by: this.authID
  };
  try {
    this.artistService.EditNewAwdInfo(payload, item.id).then(() => {
      this.alertService.showAlert('Updated', 'Award updated', 'success');
    }).catch((error: any) => {
      this.alertService.showAlert('Internal Error', error?.message || 'Failed to update award', 'error');
    });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error?.message || 'Failed to update award', 'error');
  }
}

removeAward(item: any): void {
  const id = item?.id;
  if (!id) return;
  try {
    this.artistService.delNewAwaInfo(id).then(() => {
      const list = Array.isArray(this.artistProfile?.awards) ? this.artistProfile.awards : [];
      this.artistProfile.awards = list.filter((x: any) => x.id !== id);
      this.alertService.showAlert('Successful', 'Award removed', 'success');
    }).catch((error: any) => {
      this.alertService.showAlert('Internal Error', error?.message || 'Failed to remove award', 'error');
    });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error?.message || 'Failed to remove award', 'error');
  }
}

}
