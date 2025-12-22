import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { HostsService } from '../../../services/hosts.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-hosts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe, DatePipe],
  templateUrl: './hosts.component.html'
})
export class HostsComponent implements OnInit{

constructor(
  private hostsService: HostsService,
  private fb: FormBuilder,
  private alertService: AlertService,
  private authService: AuthService
){

}

hostsArray:any = [];
id_host: number | null = null;
id_profile: string | null = null;
 editMode: boolean = false;
 form!: FormGroup;
ngOnInit(): void {
  this.form = this.fb.group({
    name: [''],
    public_name: [''],
    address: [''],
    city: [''],
    proviance: [''],
    zip: [''],
    country: [''],
    host_per_year: [''],
    capacity: [null],
    id_host_type: [null],
    contact_fname: [''],
    contact_lname: [''],
    contact_phone1: [''],
    contact_phone2: [''],
    contact_email: [''],
    web_url: [''],
    comment: [''],
    photo: [''],
    last_update_on: [new Date()]
  });
  this.getHostsProfile();
}

async getHostsProfile(){
  try {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.alertService.showAlert('Error', 'You must be logged in to view host profile', 'error');
      return;
    }
    
    this.id_profile = currentUser.id;
    let row = await this.hostsService.getHostsByProfile(this.id_profile);
    this.hostsArray = row;
    console.log('Hosts array:', this.hostsArray);
    
    const h = this.hostsArray && this.hostsArray.length ? this.hostsArray[0] : null;
    if (h) {
      this.id_host = h.id; // Store the integer host ID for updates
      this.form.patchValue({
        name: h.name ?? '',
        public_name: h.public_name ?? '',
        address: h.address ?? '',
        city: h.city ?? '',
        proviance: h.proviance ?? '',
        zip: h.zip ?? '',
        country: h.country ?? '',
        host_per_year: h.host_per_year ?? '',
        capacity: h.capacity ?? null,
        id_host_type: h.id_host_type ?? null,
        contact_fname: h.contact_fname ?? '',
        contact_lname: h.contact_lname ?? '',
        contact_phone1: h.contact_phone1 ?? '',
        contact_phone2: h.contact_phone2 ?? '',
        contact_email: h.contact_email ?? '',
        web_url: h.web_url ?? '',
        comment: h.comment ?? '',
        photo: h.photo ?? '',
        last_update_on: new Date()
      });
    }
  } catch (e: any) {
    this.alertService.showAlert('Error', e.message || 'Failed to load host profile', 'error');
  }
}

  buildMapsLink(host: any): string | null {
    if (!host) return null;
    const parts = [host.address, host.zip, host.city, host.country].filter(Boolean).join(' ');
    if (!parts) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
  }

  enableEdit(): void {
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
    const h = this.hostsArray && this.hostsArray.length ? this.hostsArray[0] : null;
    if (h) {
      this.form.reset({
        name: h.name ?? '',
        public_name: h.public_name ?? '',
        address: h.address ?? '',
        city: h.city ?? '',
        proviance: h.proviance ?? '',
        zip: h.zip ?? '',
        country: h.country ?? '',
        host_per_year: h.host_per_year ?? '',
        capacity: h.capacity ?? null,
        id_host_type: h.id_host_type ?? null,
        contact_fname: h.contact_fname ?? '',
        contact_lname: h.contact_lname ?? '',
        contact_phone1: h.contact_phone1 ?? '',
        contact_phone2: h.contact_phone2 ?? '',
        contact_email: h.contact_email ?? '',
        web_url: h.web_url ?? '',
        comment: h.comment ?? '',
        photo: h.photo ?? ''
      });
    }
  }

  async save(): Promise<void> {
    try {
      if (!this.id_host) {
        this.alertService.showAlert('Error', 'Host ID not found', 'error');
        return;
      }
      const payload = { ...this.form.value };
      // Remove last_update_on from payload as it's handled by the database
      delete payload.last_update_on;
      console.log('Updating host with payload:', payload);
      const updated = await this.hostsService.updateHostProfile(this.id_host, payload);
      if (updated) {
        this.alertService.showAlert('Saved', 'Host profile updated successfully.', 'success');
        await this.getHostsProfile();
        this.editMode = false;
      }
    } catch (e: any) {
      this.alertService.showAlert('Error', e.message || 'Failed to update host.', 'error');
    }
  }

  async onLogoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      if (!this.id_host) {
        this.alertService.showAlert('Error', 'Host ID not found', 'error');
        return;
      }
      // Convert host ID to string for the upload function (it expects a string path)
      const url = await this.hostsService.uploadHostLogo(this.id_host.toString(), file);
      this.form.patchValue({ photo: url, last_update_on: new Date() });
      this.alertService.showAlert('Uploaded', 'Logo uploaded successfully.', 'success');
    } catch (e: any) {
      this.alertService.showAlert('Error', e.message || 'Failed to upload logo.', 'error');
    } finally {
      input.value = '';
    }
  }



}
