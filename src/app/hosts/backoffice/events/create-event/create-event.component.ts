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
  step: 1 | 2 | 3 | 4 | 5 | 6 = 1;

  isSaving: boolean = false;
  isSavingDetails: boolean = false;
  uploadPreviewUrl: string | null = null;
  mainImageFile: File | null = null;
  createdEventId: number | null = null;
  mediaStep: 1 | 2 = 1;
  isEditMode: boolean = false;

  sysEvents: Array<{ id: number; name: string }> = [];
  programmes: Array<{ id: number; name: string; id_event: number }> = [];
  editions: Array<{ id: number; name: string; year: string; id_programme: number }> = [];
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
      id_event: [null, Validators.required],
      id_programme: [null, Validators.required],
      id_edition: [null, Validators.required],
      id_type: [null, Validators.required],
      id_location: [null, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      teaser: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      booking_url: ['', []],
      status: [1, Validators.required],
      dates: this.fb.array([]),
      shows: this.fb.array([])
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

      const [sysEvents, eventTypes, locations, artists, instruments, availArtists] = await Promise.all([
        this.eventService.listSysEvents(),
        this.eventService.listSysEventTypes(),
        this.eventService.listAllLocations(),
        this.eventService.listAllArtists(),
        this.eventService.listAllInstruments(),
        this.eventService.getAvailableArtists()
      ]);
      this.sysEvents = sysEvents || [];
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
        await this.prefillForEdit(this.createdEventId);
      }
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to load lookups', 'error');
    }
    // Initialize one empty date and one empty show row
    if (this.eventDates.length === 0) this.addDate();
    if (this.eventShows.length === 0) this.addShow();
    if (this.artistRows.length === 0) this.addArtistRow();
    this.loggedUser =  this.artistService.getLoggedUserID();
  }
loggedUser:any;
  // Convenience getters
  get eventDates(): FormArray { return this.detailsForm.get('dates') as FormArray; }
  get eventShows(): FormArray { return this.detailsForm.get('shows') as FormArray; }
  get mediaItems(): FormArray { return this.mediaForm.get('media') as FormArray; }
  get instrumentMappings(): FormArray { return this.artistsForm.get('instrumentMappings') as FormArray; }
  get teaserLength(): number { return (this.detailsForm.get('teaser')?.value || '').length; }
  get descriptionLength(): number { return (this.detailsForm.get('description')?.value || '').length; }

  onEventChange(): void {
    const id_event = this.detailsForm.get('id_event')?.value as number | null;
    this.programmes = [];
    this.editions = [];
    this.detailsForm.patchValue({ id_programme: null, id_edition: null });
    if (id_event) {
      this.eventService.listProgrammesByEvent(id_event).then(rows => this.programmes = rows || []);
    }
  }

  onProgrammeChange(): void {
    const id_programme = this.detailsForm.get('id_programme')?.value as number | null;
    this.editions = [];
    this.detailsForm.patchValue({ id_edition: null });
    if (id_programme) {
      this.eventService.listEditionsByProgramme(id_programme).then(rows => this.editions = rows || []);
    }
  }

  // Dates
  addDate(): void {
    this.eventDates.push(this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required]
    }));
  }

  removeDate(index: number): void {
    this.eventDates.removeAt(index);
  }

  // Shows
  addShow(): void {
    this.eventShows.push(this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      time_manage: ['']
    }));
  }

  removeShow(index: number): void {
    this.eventShows.removeAt(index);
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
      const controlsToCheck = ['id_event','id_programme','id_edition','id_type','id_location','title','description','status'];
      let valid = true;
      for (const key of controlsToCheck) {
        const c = this.detailsForm.get(key);
        if (c && c.invalid) valid = false;
      }
      if (!valid) {
        this.detailsForm.markAllAsTouched();
        this.alertService.showAlert('Validation', 'Please complete required fields in Detail', 'warning');
        return;
      }
      // Persist details first
      try {
        this.isSavingDetails = true;
        const user = await this.authService.getCurrentUser();
        const id_host = user?.id as string;
        const d = this.detailsForm.value as any;
        if (!this.createdEventId) {
          const newId = await this.eventService.createEventRow({
            title: d.title,
            teaser: d.teaser,
            id_edition: d.id_edition,
            id_location: d.id_location,
            id_type: d.id_type,
            id_host,
            description: d.description,
            booking_url: d.booking_url || null,
            photo: null,
            status: d.status || 1
          });
          this.createdEventId = newId;
          this.showAnILoader = false;
        } else {
          await this.eventService.updateEventRow(this.createdEventId, {
            title: d.title,
            teaser: d.teaser,
            id_edition: d.id_edition,
            id_location: d.id_location,
            id_type: d.id_type,
            description: d.description,
            booking_url: d.booking_url || null,
            status: d.status || 1
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
        return;
      }
      try {
        const rows = (this.eventDates.value as Array<any>).map(x => ({
          date: x.date,
          time: x.time?.length === 5 ? `${x.time}:00` : x.time
        }));
        if (!this.createdEventId) {
          this.alertService.showAlert('Error', 'Event id missing. Complete details first.', 'error');
          return;
        }
        await this.eventService.replaceEventDates(this.createdEventId, rows);
        this.showAnILoader = false;
        this.step = 3;
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save dates', 'error');
      }
    } else if (this.step === 3) {
        this.showAnILoader = true;
      // Shows optional but if present must be valid
      if (this.eventShows.length > 0 && this.eventShows.invalid) {
        this.eventShows.markAllAsTouched();
        this.alertService.showAlert('Validation', 'Please fix show entries', 'warning');
        return;
      }
      try {
        if (!this.createdEventId) {
          this.alertService.showAlert('Error', 'Event id missing. Complete details first.', 'error');
          return;
        }
        const shows = (this.eventShows.value as Array<any>).map(s => ({
          title: s.title,
          description: s.description,
          time_manage: s.time_manage || null
        }));
        await this.eventService.replaceEventShows(this.createdEventId, shows);
          this.showAnILoader = false;
        this.step = 4;
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save shows', 'error');
      }
    } else if (this.step === 4) {
        this.showAnILoader = true;
      try {
        if (!this.createdEventId) {
          this.alertService.showAlert('Error', 'Event id missing. Complete details first.', 'error');
          return;
        }
        // Save main image only
        if (this.mainImageFile) {
          const photoUrl = await this.eventService.uploadEventImage(this.mainImageFile);
          await this.eventService.updateEventRow(this.createdEventId, { photo: photoUrl });
        }
          this.showAnILoader = false;
        this.step = 5;
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save media', 'error');
      }
    } else if (this.step === 5) {
      // Save media items
        this.showAnILoader = true;
      try {
        if (!this.createdEventId) {
          this.alertService.showAlert('Error', 'Event id missing. Complete details first.', 'error');
          return;
        }
        const payload: Array<{ id_media: number; title: string; image: string | null; description: string | null; url: string | null }> = [];
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
            id_media: Number(val.id_media),
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
    if (this.step > 1) this.step = ((this.step as number) - 1) as any;
  }

  private async prefillForEdit(id_event: number): Promise<void> {
    try {
      // Load base event row
      const base = await this.eventService.getEventBase(id_event);
      if (base?.photo) this.uploadPreviewUrl = base.photo;

      // Resolve programme and event chain from edition
      const edition = base?.id_edition ? await this.eventService.getEditionById(base.id_edition) : null;
      const programme = edition?.id_programme ? await this.eventService.getProgrammeById(edition.id_programme) : null;

      // Populate dependent dropdowns
      if (programme?.id_event) {
        this.detailsForm.patchValue({ id_event: programme.id_event });
        this.programmes = await this.eventService.listProgrammesByEvent(programme.id_event) || [];
      }
      if (edition?.id_programme) {
        this.detailsForm.patchValue({ id_programme: edition.id_programme });
        this.editions = await this.eventService.listEditionsByProgramme(edition.id_programme) || [];
      }

      // Patch base fields
      this.detailsForm.patchValue({
        id_edition: base?.id_edition ?? null,
        id_type: base?.id_type ?? null,
        id_location: base?.id_location ?? null,
        title: base?.title ?? '',
        teaser: base?.teaser ?? '',
        description: base?.description ?? '',
        booking_url: base?.booking_url ?? '',
        status: base?.status ?? 1
      });

      // Dates
      const dates = await this.eventService.getEventDates(id_event);
      this.eventDates.clear();
      (dates || []).forEach((d: any) => {
        this.eventDates.push(this.fb.group({
          date: [d.date || ''],
          time: [d.time || '']
        }));
      });
      if (this.eventDates.length === 0) this.addDate();

      // Shows
      const shows = await this.eventService.getEventShows(id_event);
      this.eventShows.clear();
      (shows || []).forEach((s: any) => {
        this.eventShows.push(this.fb.group({
          title: [s.title || ''],
          description: [s.description || ''],
          time_manage: [s.time_manage || '']
        }));
      });
      if (this.eventShows.length === 0) this.addShow();

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
      const instrumentMap = new Map<number, string>((this.instruments || []).map((r: any) => [r.id, r.instrument]));
      const artistMap = new Map<string, { name: string; photo: string | null }>((this.availableArtists || []).map((a: any) => [a.id, { name: a.name, photo: a.photo || null }]));
      this.tableAnIARow = (pairs || []).map((p: any) => {
        const a = artistMap.get((p.id_artist || '').toString()) || { name: '', photo: null };
        const instName = instrumentMap.get(Number(p.id_instrument)) || '';
        return {
          id_event,
          id_artist: (p.id_artist || '').toString(),
          name: a.name,
          photo: a.photo,
          id_inst: Number(p.id_instrument),
          instrument: instName
        };
      });
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to prefill event for edit', 'error');
    }
  }

  async submit(): Promise<void> {
    // Final screen confirmation only; all data has been persisted step-by-step.
    this.alertService.showAlert('Success', 'Event saved successfully', 'success');
    this.router.navigate(['/hosts/console/events']);
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
