import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { LocationService } from '../../../../services/location.service';
import { ArtistService } from '../../../../services/artist.service';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-location-create',
  imports: [CommonModule, FormsModule, NgClass, QuillModule],
  templateUrl: './location-create.component.html',
  standalone: true,
})
export class LocationCreateComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private locationService: LocationService,
    private aritstService: ArtistService,
    private authService: AuthService
  ) { }

  loggedUsers: any;
  async ngOnInit(): Promise<void> {
    this.loggedUsers = this.aritstService.getLoggedUserID();
    const qId = this.route.snapshot.queryParamMap.get('id');
    const navStateId = history.state && history.state.id ? history.state.id : null;
    const effectiveId = qId || navStateId;
    if (effectiveId) {
      this.mode = 'edit';
      this.catchID = Number(effectiveId);
      await this.getSysAmenity();
      await this.loadExistingLocation(this.catchID);
      this.stepIndex = 0;
    } else {
      await this.getSysAmenity();
      this.stepIndex = 0;
    }
  }
  // Stepper state
  stepIndex: number = 0; // 0 = Details, 1 = Facility, 2 = Images
  mode: 'create' | 'edit' = 'create';
  // Step 1: Details form model
  details = {
    name: '',
    description: '', // max 200 chars
    public_description: '',
    restricted_description: '',
    public: false as boolean,
    capacity: '',
    address: '',
    city: '',
    // proviance: '',
    country: '',
    lat: '',
    long: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
  };

  // Step 2: Facility
  amenities: any = [];
  selectedAmenities: any[] = [];
  selectedSpecifications: any[] = [];
  selectedTypes: any[] = [];

  specifications:any = [];
  locationTypes:any = [];
  facility = {
    amenityId: '0',
    specificationId: '0',
    typeId: '0',
  };


  // Step 3: Images
  images: File[] = [];
  imagePreviews: string[] = [];
  imageCredits: string[] = []; // Store credit for each image
  uploading: boolean = false;
  existingImages: any[] = [];
  isLoadingImages: boolean = false;
  isDragging: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Quill editor configuration
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, false] }],
      ['link'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  async getSysAmenity() {
    try {
      await this.locationService.getSysAmenity().then((res) => {
        this.amenities = res;
        this.getSysSpecs();
      });
    } catch (err: any) {
      console.log(err);
    }
  }

    async getSysSpecs() {
    try {
      await this.locationService.getSysSpecs().then((res) => {
        this.specifications = res;
        this.getSysTypes();
        
      });
    } catch (err: any) {
      console.log(err);
    }
  }

    async getSysTypes() {
    try {
      await this.locationService.getSysTypes().then((res) => {
        this.locationTypes = res;
      });
    } catch (err: any) {
      console.log(err);
    }
  }


  // Navigation
  cancel(): void {
    this.router.navigate(['hosts/console/locations']);
  }

  next(): void {
    if (this.stepIndex === 0 && !this.isDetailsValid()) return;
    if (this.stepIndex === 1 && !this.isFacilityValid()) return;
    this.stepIndex = Math.min(2, this.stepIndex + 1);
  }

  back(): void {
    this.stepIndex = Math.max(0, this.stepIndex - 1);
  }

  isDetailsValid(): boolean {
    const d = this.details;
    const basicRequired = !!d.name && !!d.address && !!d.city && !!d.country;
    const descOk = (d.description || '').length <= 200;
    return basicRequired && descOk;
  }

  isFacilityValid(): boolean {
    return (
      this.selectedAmenities.length > 0 &&
      this.selectedSpecifications.length > 0 &&
      this.selectedTypes.length > 0
    );
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.addFiles(files);
    if (input) input.value = '';
  }

  removeImage(index: number): void {
    if (index < 0 || index >= this.images.length) return;
    this.images.splice(index, 1);
    this.imageCredits.splice(index, 1); // Remove credit at same index
    const url = this.imagePreviews.splice(index, 1)[0];
    if (url) URL.revokeObjectURL(url);
  }

  async submit(): Promise<void> {
    try {
      if (this.images.length === 0) {
        this.alertService.showAlert('No images', 'Please select images to upload', 'warning');
        return;
      }
      this.uploading = true;
      const createdBy = this.loggedUsers;
      await Promise.all(this.images.map((file, index) => 
        this.locationService.uploadLocationImage(file, this.catchID, createdBy, this.imageCredits[index] || '')
      ));
      // clear local selections
      this.images = [];
      this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
      this.imagePreviews = [];
      this.imageCredits = [];
      await this.loadLocationImages();
      this.alertService.showAlert('Uploaded', 'Images have been uploaded', 'success');
    } catch (err: any) {
      this.alertService.showAlert('Error', err?.message || 'Failed to upload images', 'error');
    } finally {
      this.uploading = false;
    }
  }

  catchID: number = 2;

  async detailSubmit() {
    const currentUser = await this.authService.getCurrentUser();
    const authId = currentUser?.id || this.loggedUsers;

    let arr = {
      id_host: 1,
      name: this.details.name,
      address: this.details.address,
      lat: this.details.lat,
      long: this.details.long,
      description: this.details.description,
      public_description: this.details.public_description,
      restricted_description: this.details.restricted_description,
      public: this.details.public ? 'ALL' : 'No',
      capacity: this.details.capacity,
      city: this.details.city,
     // proviance: this.details.proviance, // not used
      country: this.details.country,
      zip: this.details.zip,
      phone: this.details.phone,
      email: this.details.email,
      website: this.details.website,
      created_by: authId,
      updated_by: authId,
    };

    try {
      if (this.mode === 'edit') {
        const updateArr = {
          name: arr.name,
          address: arr.address,
          lat: arr.lat,
          long: arr.long,
          description: arr.description,
          public_description: arr.public_description,
          restricted_description: arr.restricted_description,
          public: this.details.public ? 'ALL' : 'No',
          capacity: arr.capacity,
          city: arr.city,
         // proviance: arr.proviance, // not used
          country: arr.country,
          zip: arr.zip,
          phone: arr.phone,
          email: arr.email,
          website: arr.website,
          updated_by: authId,
          last_update: new Date(),
        };
        await this.locationService.updateLocationDetails(this.catchID, updateArr);
        this.alertService.showAlert('Successful', 'Details updated', 'success');
        this.stepIndex = 1;
      } else {
        await this.locationService.addLocationDetails(arr).then((res) => {
          this.alertService.showAlert(
            'Succesful',
            'The details are added',
            'success'
          );
          this.catchID = res[0].id;
          this.stepIndex = 1;
        });
      }
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  private async loadExistingLocation(id: number){
    try{
      const rows = await this.locationService.getLocationInfo(id);
      const loc = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (!loc) return;
      this.details = {
        name: loc.name || '',
        description: loc.description || '',
        public_description: loc.public_description || '',
        restricted_description: loc.restricted_description || '',
        public: ((): boolean => {
          const v: any = (loc as any)?.public;
          if (typeof v === 'boolean') return v;
          if (typeof v === 'number') return v === 1;
          if (typeof v === 'string') {
            const s = v.trim().toUpperCase();
            if (s === 'ALL') return true;
            if (s === 'NO') return false;
            if (s === 'TRUE' || s === '1') return true;
            if (s === 'FALSE' || s === '0') return false;
          }
          return false;
        })(),
        capacity: loc.capacity || '',
        address: loc.address || '',
        city: loc.city || '',
       // proviance: loc.proviance || '', // not used
        country: loc.country || '',
        lat: loc.lat || '',
        long: loc.long || '',
        zip: loc.zip || '',
        phone: loc.phone || '',
        email: loc.email || '',
        website: loc.website || '',
      };

      // Prefill facility selections and options
      this.selectedAmenities = (loc.amenities || []).map((a:any)=> ({ id: a.id_amenity || a.id, name: a.name }));
      this.selectedSpecifications = (loc.specs || []).map((s:any)=> ({ id: s.id_specs || s.id, name: s.name }));
      this.selectedTypes = (loc.types || []).map((t:any)=> ({ id: t.id_location_type || t.id, name: t.name }));

      // Remove already selected from available pools
      const amenityIds = new Set(this.selectedAmenities.map((x:any)=> Number(x.id)));
      this.amenities = (this.amenities || []).filter((a:any)=> !amenityIds.has(Number(a.id)));

      const specIds = new Set(this.selectedSpecifications.map((x:any)=> Number(x.id)));
      this.specifications = (this.specifications || []).filter((s:any)=> !specIds.has(Number(s.id)));

      const typeIds = new Set(this.selectedTypes.map((x:any)=> Number(x.id)));
      this.locationTypes = (this.locationTypes || []).filter((t:any)=> !typeIds.has(Number(t.id)));

      // Prefill images section
      this.existingImages = (loc.images || []).map((img:any)=> ({ id: img.id, url: img.url }));
      this.stepIndex = 0;
    }catch(err){
      console.error(err);
    }
  }

  addAmenity(): void {
    try {
      if (!this.amenities || this.facility.amenityId === '0') return;

      const amenityIdNum = Number(this.facility.amenityId);
      console.log(amenityIdNum);

      const amenity = this.amenities.find((a: any) => a.id === amenityIdNum);
      console.log(amenity);

      if (!amenity) return;
      let arr = {
        id_location: this.catchID,
        id_amenity: amenityIdNum,
        created_by: this.loggedUsers,
      };

      this.locationService.addLocationAmenity(arr).then(() => {
        const alreadyAdded = this.selectedAmenities.some(
          (a: any) => a.id === amenity.id
        );
        if (!alreadyAdded) this.selectedAmenities.push(amenity);
        this.facility.amenityId = '0';

        this.amenities = this.amenities.filter(
          (item: { id: any }) => item.id !== amenityIdNum
        );
        this.alertService.showAlert(
          'Succesful',
          'The amenity is added',
          'success'
        );
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

  removeAmenity(id: number): void {
    try {
      this.locationService
        .removeLocationAmenity(this.catchID, id)
        .then((res) => {
          let row = this.selectedAmenities.find((a: any) => a.id == id);
          this.amenities.push(row);
        });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    } finally {
      this.alertService.showAlert(
        'Removed',
        'The amenity is removed',
        'warning'
      );

      this.selectedAmenities = this.selectedAmenities.filter(
        (a: any) => a.id !== id
      );
    }
  }


addSpecification(): void {
  try {
    if (!this.specifications || this.facility.specificationId === '0') return;

    const specIdNum = Number(this.facility.specificationId);
    console.log(specIdNum);

    const spec = this.specifications.find((s: any) => s.id === specIdNum);
    console.log(spec);

    if (!spec) return;

    let arr = {
      id_location: this.catchID,
      id_specs: specIdNum,
      created_by: this.loggedUsers,
    };

    this.locationService.addLocationSpecs(arr).then(() => {
      const alreadyAdded = this.selectedSpecifications.some(
        (s: any) => s.id === spec.id
      );
      if (!alreadyAdded) this.selectedSpecifications.push(spec);
      this.facility.specificationId = '0';

      this.specifications = this.specifications.filter(
        (item: { id: any }) => item.id !== specIdNum
      );

      this.alertService.showAlert(
        'Succesful',
        'The specification is added',
        'success'
      );
    });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error.message, 'error');
  }
}

removeSpecification(id: number) {
  console.log('---id', id);
  console.log('this.selectedSpecifications', this.selectedSpecifications);
  try {
    this.locationService
      .removeLocationSpecs(this.catchID, id)
      .then(() => {
        console.log('init specifications', this.specifications);

        let row = this.selectedSpecifications.find(
          (s: any) => Number(s.id) === Number(id)
        );

        console.log('row', row);
        console.log('pre specifications', this.specifications);

        if (row) {
          this.specifications.push(row);
        }

        // ✅ Now remove from selected after we’ve restored
        this.selectedSpecifications = this.selectedSpecifications.filter(
          (s: any) => Number(s.id) !== Number(id)
        );

        console.log('post specifications', this.specifications);

        this.alertService.showAlert(
          'Removed',
          'The specification is removed',
          'warning'
        );
      });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error.message, 'error');
  }
}


addType(): void {
  try {
    if (!this.locationTypes || this.facility.typeId === '0') return;

    const typeIdNum = Number(this.facility.typeId);
    console.log(typeIdNum);

    const type = this.locationTypes.find((t: any) => t.id === typeIdNum);
    console.log(type);

    if (!type) return;

    let arr = {
      id_location: this.catchID,
      id_location_type: typeIdNum,
      created_by: this.loggedUsers,
    };

    this.locationService.addLocationType(arr).then(() => {
      const alreadyAdded = this.selectedTypes.some(
        (t: any) => t.id === type.id
      );
      if (!alreadyAdded) this.selectedTypes.push(type);
      this.facility.typeId = '0';

      this.locationTypes = this.locationTypes.filter(
        (item: { id: any }) => item.id !== typeIdNum
      );

      this.alertService.showAlert(
        'Succesful',
        'The type is added',
        'success'
      );
    });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error.message, 'error');
  }
}

 

removeType(id: number): void {
  console.log('---id', id);
  console.log('this.selectedTypes', this.selectedTypes);
  try {
    this.locationService
      .removeLocationType(this.catchID, id)
      .then(() => {
        console.log('init locationTypes', this.locationTypes);

        let row = this.selectedTypes.find(
          (t: any) => Number(t.id) === Number(id)
        );

        console.log('row', row);
        console.log('pre locationTypes', this.locationTypes);

        if (row) {
          this.locationTypes.push(row);
        }

        // ✅ Remove from selected list
        this.selectedTypes = this.selectedTypes.filter(
          (t: any) => Number(t.id) !== Number(id)
        );

        console.log('post locationTypes', this.locationTypes);

        this.alertService.showAlert(
          'Removed',
          'The type is removed',
          'warning'
        );
      });
  } catch (error: any) {
    this.alertService.showAlert('Internal Error', error.message, 'error');
  }
}

nextImage(){
  this.stepIndex = 2;
  this.loadLocationImages();
}


async loadLocationImages(){
  if(!this.catchID) return;
  this.isLoadingImages = true;
  try{
    const imgs = await this.locationService.listLocationImages(this.catchID);
    this.existingImages = imgs || [];
  }catch(err:any){
    console.error(err);
  }finally{
    this.isLoadingImages = false;
  }
}

async deleteExistingImage(id: number){
  try{
    await this.locationService.deleteLocationImage(id);
    this.existingImages = this.existingImages.filter((img:any)=> img.id !== id);
    this.alertService.showAlert('Removed', 'Image removed', 'warning');
  }catch(err:any){
    this.alertService.showAlert('Error', err?.message || 'Failed to delete image', 'error');
  }
}

  private addFiles(files: File[]) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    for (const file of imageFiles) {
      this.images.push(file);
      const url = URL.createObjectURL(file);
      this.imagePreviews.push(url);
      this.imageCredits.push(''); // Initialize with empty credit
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
    if (files.length) {
      this.addFiles(files);
    }
  }

  openFilePicker() {
    this.fileInput?.nativeElement.click();
  }

  done(){
    this.alertService.showAlert('Successful', 'New location is created', 'success')
    this.router.navigate(['hosts/console/locations']);
  }

}
