import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../services/event.service';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';
import { ArtistService } from '../../../../services/artist.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event.component.html'
})
export class CreateEventComponent implements OnInit {
  step: 1 | 2 | 4 | 5 | 6 = 1; // Step 3 removed (no event_shows table)

  isSaving: boolean = false;
  isSavingDetails: boolean = false;
  isLoadingEvent: boolean = false;
  isDeleting: boolean = false;
  uploadPreviewUrl: string | null = null;
  mainImageFile: File | null = null;
  createdEventId: number | null = null;
  mediaStep: 1 | 2 = 1;
  isEditMode: boolean = false;

  eventDomains: Array<{ id: number; name: string }> = [];
  editionTypes: Array<{ id: number; name: string }> = [];
  editions: Array<{ id: number; name: string; year: string; id_edition_type: number }> = [];
  eventTypes: Array<{ id: number; name: string }> = [];
  locations: any[] = [];
  artists: any[] = [];
  instruments: Array<{ id: number; instrument: string }> = [];

  // Step 1 form: Details
  detailsForm: FormGroup;

  // Step 2 form: Media (main image + media list)
  mediaForm: FormGroup;

  // Step 5 form: Artists & Instruments
  artistsForm: FormGroup;
  availableArtists: any[] = [];
  artistRows: Array<{ id_artist: string | null; photo?: string | null; name?: string; instruments: Array<{ id_instrument: number; label: string }>; availableInstruments: Array<{ id: number; instrument: string }>; loadingInstruments: boolean }>=[];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private alertService: AlertService,
    private artistService: ArtistService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.detailsForm = this.fb.group({
      id_event_domain: [null],
      id_edition_type: [null],
      id_edition: [null, Validators.required],
      id_event_type: [null, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      teaser: ['', [Validators.maxLength(200)]],
      long_teaser: [''],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      booking_url: [''],
      credit_photo: [''],
      status: [1, Validators.required],
      is_active: [false],
      dates: this.fb.array([])
    });

    this.mediaForm = this.fb.group({
      media: this.fb.array([]) // {id_media, title, description, url, imageFile, existingImageUrl}
    });

    this.artistsForm = this.fb.group({
      artistIds: [[] as string[]],
      instrumentMappings: this.fb.array([]) // {id_instrument, id_artist?}
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const idParam = this.route.snapshot.paramMap.get('id');
      const editingId = idParam ? Number(idParam) : null;
      this.isEditMode = !!editingId && !Number.isNaN(editingId);
      if (this.isEditMode) this.createdEventId = editingId as number;

      const [eventDomains, editionTypes, eventTypes, locations, artists, instruments, availArtists] = await Promise.all([
        this.eventService.listSysEventDomains(),
        this.eventService.listSysEventEditions(),
        this.eventService.listSysEventTypes(),
        this.eventService.listAllLocations(),
        this.eventService.listAllArtists(),
        this.eventService.listAllInstruments(),
        this.eventService.getAvailableArtists()
      ]);
      this.eventDomains = eventDomains || [];
      this.editionTypes = editionTypes || [];
      this.eventTypes = eventTypes || [];
      this.locations = locations || [];
      this.artists = artists || [];
   
      this.instruments = (instruments || []).map((r: any) => ({ id: r.id, instrument: r.instrument || r.name || '' }));
      this.availableArtists = (availArtists || []).map((a: any) => ({
        id: (a.id || a.id_artist || a.artist_id || '').toString(),
        name: `${(a.fname||a.first_name||'').trim()} ${(a.lname||a.last_name||'').trim()}`.trim(),
        photo: a.photo || a.image || null
      })).filter((a: any) => a.id && a.id !== '');
         console.log('availArtists-00000', this.availableArtists);
      if (this.isEditMode && this.createdEventId) {
        this.isLoadingEvent = true;
        await this.prefillForEdit(this.createdEventId);
        this.isLoadingEvent = false;
      }
    } catch (err: any) {
      this.isLoadingEvent = false;
      this.alertService.showAlert('Error', err.message || 'Failed to load lookups', 'error');
    }
    // Initialize one empty date row
    if (this.eventDates.length === 0) this.addDate();
    if (this.artistRows.length === 0) this.addArtistRow();
    this.loggedUser =  this.artistService.getLoggedUserID();
  }
loggedUser:any;
  // Convenience getters
  get eventDates(): FormArray { return this.detailsForm.get('dates') as FormArray; }
  get mediaItems(): FormArray { return this.mediaForm.get('media') as FormArray; }
  get instrumentMappings(): FormArray { return this.artistsForm.get('instrumentMappings') as FormArray; }
  get teaserLength(): number { return (this.detailsForm.get('teaser')?.value || '').length; }
  get descriptionLength(): number { return (this.detailsForm.get('description')?.value || '').length; }

  private buildDateGroup(data?: Partial<{ start_date: string; end_date: string; time: string; id_location: number | null; flag: string }>): FormGroup {
    const group = this.fb.group({
      start_date: [data?.start_date || '', Validators.required],
      end_date: [data?.end_date || ''],
      time: [data?.time || ''],
      id_location: [data?.id_location ?? null],
      flag: [data?.flag || '', Validators.required]
    });
    this.applyDateTypeRules(group);
    return group;
  }

  private applyDateTypeRules(group: FormGroup): void {
    const flag = (group.get('flag')?.value || '') as string;
    const timeCtrl = group.get('time');
    const endCtrl = group.get('end_date');

    if (flag === 'p') {
      endCtrl?.setValidators([Validators.required]);
      timeCtrl?.clearValidators();
      if (timeCtrl?.value) timeCtrl.setValue('', { emitEvent: false });
    } else if (flag === 'd') {
      timeCtrl?.setValidators([Validators.required]);
      endCtrl?.clearValidators();
      if (endCtrl?.value) endCtrl.setValue('', { emitEvent: false });
    } else {
      timeCtrl?.clearValidators();
      endCtrl?.clearValidators();
    }

    timeCtrl?.updateValueAndValidity({ emitEvent: false });
    endCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  onDateTypeChange(index: number): void {
    const group = this.eventDates.at(index) as FormGroup | undefined;
    if (!group) return;
    this.applyDateTypeRules(group);
  }

  isPeriod(index: number): boolean {
    const group = this.eventDates.at(index) as FormGroup | undefined;
    return (group?.get('flag')?.value || '') === 'p';
  }

  isSingleDate(index: number): boolean {
    const group = this.eventDates.at(index) as FormGroup | undefined;
    return (group?.get('flag')?.value || '') === 'd';
  }

  private formatTimeForInput(value?: string | null): string {
    if (!value) return '';
    const asString = value.toString();
    return asString.length >= 5 ? asString.substring(0, 5) : asString;
  }

  onEventDomainChange(): void {
    // Event domain changed - currently doesn't filter anything, but can be used for future filtering
    const id_event_domain = this.detailsForm.get('id_event_domain')?.value as number | null;
    // Keep edition types and editions unchanged
  }

  onEditionTypeChange(): void {
    const id_edition_type = this.detailsForm.get('id_edition_type')?.value as number | null;
    this.editions = [];
    this.detailsForm.patchValue({ id_edition: null });
    if (id_edition_type) {
      this.eventService.listEditionsByType(id_edition_type).then(rows => this.editions = rows || []);
    } else {
      // Load all editions if no type selected
      this.eventService.listEditionsByType(null).then(rows => this.editions = rows || []);
    }
  }

  // Dates
  addDate(): void {
    this.eventDates.push(this.buildDateGroup());
  }

  removeDate(index: number): void {
    this.eventDates.removeAt(index);
  }

  // Media
  addMediaItem(id_media: 1 | 2 = 1): void {
    this.mediaItems.push(this.fb.group({
      id_media: [id_media, Validators.required],
      title: ['', Validators.required],
      description: [''],
      url: [''],
      imageFile: [null],
      existingImageUrl: [null]
    }));
  }

  removeMediaItem(index: number): void {
    this.mediaItems.removeAt(index);
  }

  setMediaType(index: number, type: 1 | 2): void {
    const group = this.mediaItems.at(index) as FormGroup;
    group.patchValue({ id_media: type });
  }

  onMainImageSelected(event: any): void {
    const file: File | null = event?.target?.files?.[0] || null;
    this.mainImageFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.uploadPreviewUrl = reader.result as string;
      reader.readAsDataURL(file);
    } else {
      this.uploadPreviewUrl = null;
    }
  }

  onMediaImageSelected(event: any, index: number): void {
    const file: File | null = event?.target?.files?.[0] || null;
    if (!file) return;
    const group = this.mediaItems.at(index) as FormGroup;
    group.patchValue({ imageFile: file });
  }

  // Instruments mapping rows
  addInstrumentMapping(): void {
    this.instrumentMappings.push(this.fb.group({
      id_instrument: [null, Validators.required],
      id_artist: [null]
    }));
  }

  removeInstrumentMapping(index: number): void {
    this.instrumentMappings.removeAt(index);
  }

  // Artist rows table API
  addArtistRow(): void {
    this.artistRows.push({ id_artist: null, instruments: [], availableInstruments: [], loadingInstruments: false });
  }

  removeArtistRow(i: number): void {
    // If table row exists (modal-driven list), remove the entire artist from this event
    const tRow = this.tableAnIARow && this.tableAnIARow[i];
    
    if (tRow) {
      const id_event = tRow.id_event || this.createdEventId;
      const id_artist = tRow.id_artist;
      if (id_event && id_artist) {
        this.eventService.removeEventArtist(id_event, id_artist)
          .then(() => {
            this.tableAnIARow = this.tableAnIARow.filter((r: any) => r.id_artist !== id_artist);
            this.alertService.showAlert('Removed', 'Instrument & Artist is removed', 'warning');
          })
          .catch((err: any) => this.alertService.showAlert('Error', err.message || 'Failed to remove artist', 'error'));
      } else {
        this.tableAnIARow.splice(i, 1);
      }
      return;
    }

    // Fallback to legacy artistRows removal
    const row = this.artistRows[i];
    if (row && row.id_artist && this.createdEventId) {
      this.eventService.removeEventArtist(this.createdEventId, row.id_artist)
        .then(() => {
          this.artistRows.splice(i, 1);
        })
        .catch((err: any) => this.alertService.showAlert('Error', err.message || 'Failed to remove artist', 'error'));
    } else {
      this.artistRows.splice(i, 1);
    }
  }


  async onArtistSelected(i: number, id_artist: string | null): Promise<void> {

    console.log(i)
    console.log(id_artist)
    const row = this.artistRows[i];
   
    row.id_artist = (id_artist && id_artist.length > 0) ? id_artist : null;
    row.instruments = [];

    row.availableInstruments = [];
    
    if (!row.id_artist) return;
    // createdEventId must be set when Details are saved; do not override here
    if (!this.createdEventId) {
      this.alertService.showAlert('Error', 'Please save Details first to create the event.', 'error');
      return;
    }
    // Ensure event_artists row exists as soon as artist is selected
    try {
      await this.eventService.ensureEventArtist(this.createdEventId, row.id_artist);
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to link artist to event', 'error');
    }
    row.loadingInstruments = true;
    try {
      const data = await this.eventService.getArtistInstruments(row.id_artist);
      row.availableInstruments = (data || []).map((r: any) => ({ id: r.id_instrument || r.id, instrument: r.instrument || r.name }));
      const artistMeta = this.availableArtists.find(a => a.id === row.id_artist);
      row.photo = artistMeta?.photo || null;
      row.name = artistMeta?.name || '';
    } catch (err) {
      // ignore
    } finally {
      row.loadingInstruments = false;
    }
  }

  async addRowInstrument(i: number, id_instrument: number): Promise<void> {
    const row = this.artistRows[i];
    if (!row || !id_instrument || !row.id_artist) return;
    if (!this.createdEventId) {
      this.alertService.showAlert('Error', 'Please save Details first to create the event.', 'error');
      return;
    }
    try {
      await this.eventService.addEventInstrument(this.createdEventId, row.id_artist, id_instrument);
      const label = (row.availableInstruments.find(ai => ai.id === id_instrument)?.instrument) || '';
      if (!row.instruments.some(x => x.id_instrument === id_instrument)) {
        row.instruments.push({ id_instrument, label });
      }
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to add instrument', 'error');
    }
  }

  addRowInstrumentFromSelect(i: number, selectEl: HTMLSelectElement): void {
    const raw = selectEl.value;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return;
    this.addRowInstrument(i, value);
    selectEl.value = '' as any;
  }

  async removeRowInstrument(i: number, id_instrument: number): Promise<void> {
    const row = this.artistRows[i];
    if (!row || !row.id_artist || !this.createdEventId) return;
    try {
      await this.eventService.removeEventInstrument(this.createdEventId, row.id_artist, id_instrument);
      row.instruments = row.instruments.filter(x => x.id_instrument !== id_instrument);
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to remove instrument', 'error');
    }
  }

  // Navigation
  async next(): Promise<void> {
    if (this.step === 1) {
      this.showAnILoader = true;
      // Validate Details (exclude dates/shows)
      const controlsToCheck = ['id_edition','id_event_type','title','description','status'];
      let valid = true;
      for (const key of controlsToCheck) {
        const c = this.detailsForm.get(key);
        if (c && c.invalid) valid = false;
      }
      if (!valid) {
        this.detailsForm.markAllAsTouched();
        this.alertService.showAlert('Validation', 'Please complete required fields in Detail', 'warning');
        this.showAnILoader = false;
        return;
      }
      // Persist details first
      try {
        this.isSavingDetails = true;
        const d = this.detailsForm.value as any;
        if (!this.createdEventId) {
          const newId = await this.eventService.createEventRow({
            title: d.title,
            teaser: d.teaser || null,
            long_teaser: d.long_teaser || null,
            id_edition: d.id_edition,
            id_event_domain: d.id_event_domain || null,
            id_event_type: d.id_event_type,
            description: d.description,
            booking_url: d.booking_url || null,
            photo: null,
            credit_photo: d.credit_photo || null,
            status: d.status,
            is_active: d.is_active || false
          });
          this.createdEventId = newId;
          this.showAnILoader = false;
        } else {
          await this.eventService.updateEventRow(this.createdEventId, {
            title: d.title,
            teaser: d.teaser || null,
            long_teaser: d.long_teaser || null,
            id_edition: d.id_edition,
            id_event_domain: d.id_event_domain || null,
            id_event_type: d.id_event_type,
            description: d.description,
            booking_url: d.booking_url || null,
            credit_photo: d.credit_photo || null,
            status: d.status,
            is_active: d.is_active || false
          });
        }
             this.showAnILoader = false;
        this.step = 2;
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save details', 'error');
        return;
      } finally {
        this.isSavingDetails = false;
      }
    } else if (this.step === 2) {
      this.showAnILoader = true;
      // Validate and persist dates
      if (this.eventDates.length === 0 || this.eventDates.invalid) {
        this.eventDates.markAllAsTouched();
        this.alertService.showAlert('Validation', 'Please add at least one date', 'warning');
        this.showAnILoader = false;
        return;
      }
      try {
        const rows = (this.eventDates.value as Array<any>).map(x => {
          const isSingleDate = x.flag === 'd';
          const isPeriod = x.flag === 'p';
          const normalizedTime = isSingleDate && x.time
            ? (x.time.length === 5 ? `${x.time}:00` : x.time)
            : null;

          return {
            start_date: x.start_date,
            end_date: isPeriod ? (x.end_date || null) : (x.start_date || null),
            time: normalizedTime,
            id_location: x.id_location || null,
            flag: x.flag || null
          };
        });
        if (!this.createdEventId) {
          this.alertService.showAlert('Error', 'Event id missing. Complete details first.', 'error');
          this.showAnILoader = false;
          return;
        }
        await this.eventService.replaceEventDates(this.createdEventId, rows);
        this.showAnILoader = false;
        this.step = 4; // Skip step 3 (no event_shows table)
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save dates', 'error');
        this.showAnILoader = false;
      }
    } else if (this.step === 4) {
      this.showAnILoader = true;
      try {
        if (!this.createdEventId) {
          this.alertService.showAlert('Error', 'Event id missing. Complete details first.', 'error');
          this.showAnILoader = false;
          return;
        }
        // Save main image only
        if (this.mainImageFile) {
          console.log('Uploading image...');
          const photoUrl = await this.eventService.uploadEventImage(this.mainImageFile);
          console.log('Image uploaded successfully:', photoUrl);
          
          console.log('Updating event with photo URL...');
          await this.eventService.updateEventRow(this.createdEventId, { photo: photoUrl });
          console.log('Event photo updated successfully');
          
          this.uploadPreviewUrl = photoUrl; // Update preview
          this.alertService.showAlert('Success', 'Image uploaded successfully', 'success');
        }
        this.showAnILoader = false;
        this.step = 5;
      } catch (err: any) {
        console.error('Image upload error:', err);
        this.showAnILoader = false;
        this.alertService.showAlert('Error', err.message || 'Failed to save image', 'error');
      }
    } else if (this.step === 5) {
      // Save media items
        this.showAnILoader = true;
      try {
        if (!this.createdEventId) {
          this.alertService.showAlert('Error', 'Event id missing. Complete details first.', 'error');
          return;
        }
        const payload: Array<{ id_media_type: number; title: string; image: string | null; description: string | null; url: string | null }> = [];
        for (let i = 0; i < this.mediaItems.length; i++) {
          const row = this.mediaItems.at(i) as FormGroup;
          const val = row.value as any;
          let imgUrl: string | null = null;
          const file: File | null = val.imageFile || null;
          if (file) {
            imgUrl = await this.eventService.uploadEventImage(file);
          } else {
            imgUrl = val.existingImageUrl || null;
          }
          payload.push({
            id_media_type: Number(val.id_media_type),
            title: val.title,
            image: imgUrl,
            description: val.description || null,
            url: val.url || null
          });
        }
        await this.eventService.replaceEventMedia(this.createdEventId, payload);
          this.showAnILoader = false;
        this.step = 6;
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save media', 'error');
      }
    }
  }

  back(): void {
    if (this.step === 4 && this.mediaStep === 2) {
      this.mediaStep = 1;
      return;
    }
    // Handle back navigation, skipping step 3 (no event_shows table)
    if (this.step === 4) {
      this.step = 2; // Skip step 3
    } else if (this.step > 1) {
      this.step = ((this.step as number) - 1) as any;
    }
  }

  private async prefillForEdit(id_event: number): Promise<void> {
    try {
      // Load base event row
      const base = await this.eventService.getEventBase(id_event);
      if (base?.photo) this.uploadPreviewUrl = base.photo;

      // Resolve edition and edition type chain
      const edition = base?.id_edition ? await this.eventService.getEditionById(base.id_edition) : null;
      
      // Load all editions for the dropdown (filtered by edition type if available)
      if (edition?.id_edition_type) {
        this.detailsForm.patchValue({ id_edition_type: edition.id_edition_type });
        this.editions = await this.eventService.listEditionsByType(edition.id_edition_type) || [];
      } else {
        this.editions = await this.eventService.listEditionsByType(null) || [];
      }

      // Patch base fields
      this.detailsForm.patchValue({
        id_event_domain: base?.id_event_domain ?? null,
        id_edition_type: edition?.id_edition_type ?? null,
        id_edition: base?.id_edition ?? null,
        id_event_type: base?.id_event_type ?? null,
        title: base?.title ?? '',
        teaser: base?.teaser ?? '',
        long_teaser: base?.long_teaser ?? '',
        description: base?.description ?? '',
        booking_url: base?.booking_url ?? '',
        credit_photo: base?.credit_photo ?? '',
        status: base?.status ?? 1,
        is_active: base?.is_active ?? false
      });

      // Dates
      const dates = await this.eventService.getEventDates(id_event);
      this.eventDates.clear();
      (dates || []).forEach((d: any) => {
        this.eventDates.push(this.buildDateGroup({
          start_date: d.start_date || '',
          end_date: d.end_date || '',
          time: d.flag === 'd' ? this.formatTimeForInput(d.time) : '',
          id_location: d.id_location || null,
          flag: d.flag || ''
        }));
      });
      if (this.eventDates.length === 0) this.addDate();

      // Media
      const media = await this.eventService.getEventMedia(id_event);
      this.mediaItems.clear();
      (media || []).forEach((m: any) => {
        this.mediaItems.push(this.fb.group({
          id_media: [m.id_media || 1, Validators.required],
          title: [m.title || '', Validators.required],
          description: [m.description || ''],
          url: [m.url || ''],
          imageFile: [null],
          existingImageUrl: [m.image || null]
        }));
      });

      // Artists & Instruments table rows
      const pairs = await this.eventService.getEventArtistInstrumentPairs(id_event);
      console.log('Artist-Instrument pairs from service:', pairs);
      console.log('Total pairs found:', pairs?.length || 0);
      
      this.tableAnIARow = (pairs || []).map((p: any) => {
        const artistIdStr = (p.id_artist || '').toString();
        // Use data from the joined query first, fallback to maps
        const artistName = p.artist_fname && p.artist_lname 
          ? `${p.artist_fname} ${p.artist_lname}`.trim()
          : this.availableArtists.find((a: any) => a.id === artistIdStr)?.name || `Artist ${artistIdStr}`;
        
        const artistPhoto = p.artist_photo 
          || this.availableArtists.find((a: any) => a.id === artistIdStr)?.photo 
          || null;
        
        const instrumentName = p.instrument_name 
          || this.instruments.find((i: any) => i.id === Number(p.id_instrument))?.instrument 
          || 'Unknown Instrument';
        
        console.log(`✓ Loaded - Artist: ${artistName} (ID: ${artistIdStr}) plays ${instrumentName} (ID: ${p.id_instrument})`);
        
        return {
          id: p.id,
          id_event,
          id_artist: artistIdStr,
          name: artistName,
          photo: artistPhoto,
          id_inst: Number(p.id_instrument),
          instrument: instrumentName
        };
      });
      
      console.log('✓✓ Final tableAnIARow:', this.tableAnIARow);
      console.log('✓✓ Total artists displayed:', this.tableAnIARow.length);
      
    } catch (err: any) {
      console.error('Prefill error:', err);
      this.alertService.showAlert('Error', err.message || 'Failed to prefill event for edit', 'error');
    } finally {
      this.isLoadingEvent = false;
    }
  }

  async submit(): Promise<void> {
    // Final screen confirmation only; all data has been persisted step-by-step.
    this.alertService.showAlert('Success', 'Event saved successfully', 'success');
    this.router.navigate(['/hosts/console/events']);
  }

  async deleteEvent(): Promise<void> {
    if (!this.createdEventId) {
      this.alertService.showAlert('Error', 'No event to delete', 'error');
      return;
    }

    // Confirm deletion with SweetAlert
    const confirmed = await this.alertService.confirmDelete(
      'Delete Event?',
      'Are you sure you want to delete this event? This action cannot be undone and will remove all related data (dates, media, artists).',
      'Yes, delete it!'
    );
    
    if (!confirmed) return;

    this.isDeleting = true;
    try {
      await this.eventService.deleteEvent(this.createdEventId);
      this.alertService.showAlert('Success', 'Event deleted successfully', 'success');
      this.router.navigate(['/hosts/console/events']);
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to delete event', 'error');
    } finally {
      this.isDeleting = false;
    }
  }

  selectedArtist6:any;
  availInstList:any = [];
  async selectArtist6(e:any){
    const raw = e?.target?.value ?? null;
    this.selectedArtist6 = raw && raw !== '0' ? raw : null;
    this.availInstList = [];
    if (!this.selectedArtist6) return;

    try{
      this.availInstList = await this.eventService.getArtistInstruments(this.selectedArtist6).then((res:any)=>{
        return (res || []).map((r:any) => ({
          id_inst: r.id_instrument ?? r.id ?? r.id_inst,
          instrument: r.instrument ?? r.name ?? ''
        }));
      })
    }catch(error:any){
      this.alertService.showAlert('Internal Error',error.message, 'error');
    }finally{
      console.log(this.availInstList);
    }


  }

selectedInst6:any;
  selectInst6(e:any){
    
    const raw = e?.target?.value ?? null;
    this.selectedInst6 = raw && raw !== '0' ? Number(raw) : null;
  }

  showAnImodal:boolean = false;
  showAnILoader:boolean =false;

 async submitAnI(){
  if (!this.createdEventId) {
    this.alertService.showAlert('Error', 'Please save Details first to create the event.', 'error');
    return;
  }
  if (!this.selectedArtist6 || !this.selectedInst6) {
    this.alertService.showAlert('Validation', 'Please select both Artist and Instrument', 'warning');
    return;
  }

  this.showAnILoader = true;

  let arr = {
    id_artist: this.selectedArtist6,
    id_inst: this.selectedInst6,
    id_event: this.createdEventId,
    created_by: this.loggedUser
  }

  console.log(this.availableArtists);
  console.log(this.availInstList);

try{
  const exists = await this.eventService.eventInstrumentExists(arr.id_event as number, arr.id_artist as string, arr.id_inst as number);
  if (exists) {
    this.alertService.showAlert('Duplicate', 'This artist already has this instrument added to the event.', 'warning');
    return;
  }
  await this.eventService.allAnI(arr);
  this.createAnIArray(arr);
  this.alertService.showAlert('Successful', 'Artist and Instrument is added', 'success');
  this.showAnImodal = false;
}catch(error:any){
  this.alertService.showAlert('Internal Error',error.message, 'error');
}finally{
  this.showAnILoader = false;
}
 }

 tableAnIARow:any = [];
  createAnIArray(arr:any){
      console.log('arr', arr);
          console.log('this.availableArtists', this.availableArtists);
          console.log('this.availInstList', this.availInstList);
  const rowArt:any = this.availableArtists.filter((item)=> item.id == arr.id_artist);
  const rowIns:any = this.availInstList.filter((item1: { id_inst: number; })=> item1.id_inst == Number(arr.id_inst));
    console.log('arr', arr);
    console.log('rowArt', rowArt);
    console.log('rowIns', rowIns);

  let newRow = {
    id_event: arr.id_event,
    id_artist: rowArt[0].id,
    name: rowArt[0].name,
    photo: rowArt[0].photo,
    id_inst: rowIns[0].id_inst,
    instrument: rowIns[0].instrument
  }
  console.log(newRow)
  this.tableAnIARow.push(newRow)

 }







}
