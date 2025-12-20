import { CommonModule, NgClass, NgFor, NgForOf, NgIf } from '@angular/common';
import { Component, effect, signal, OnInit } from '@angular/core';
import { ArtistRequest, ArtistService } from '../../../services/artist.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-request',
  imports: [FormsModule, ReactiveFormsModule, NgClass, NgForOf, NgFor, CommonModule, RouterLink],
  templateUrl: './request.component.html',
})
export class RequestComponent implements OnInit {
  // Tab management
  activeTab = signal(1); // Start with "All Requests"
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 = 1; // Current step in the form

  // Loading states
  isSaving: boolean = false;
  isLoadingData: boolean = false;
  isLoadingRequests: boolean = false;
  isEditMode: boolean = false;
  
  // Event Request ID
  createdRequestId: number | null = null;
  
  // Artist info
  artistID: any;
  authID: any;
  createdBy: any;

  // Image preview
  uploadPreviewUrl: string | null = null;
  mainImageFile: File | null = null;

  // Dropdowns data
  eventDomains: Array<{ id: number; name: string }> = [];
  eventTypes: Array<{ id: number; name: string }> = [];
  availableArtists: any[] = [];
  instruments: Array<{ id: number; instrument: string }> = [];

  // Forms for each step
  detailsForm: FormGroup;
  datesForm: FormGroup;
  imageForm: FormGroup;
  mediaForm: FormGroup;
  artistsForm: FormGroup;
  commentsForm: FormGroup;

  // Artist rows for step 5
  artistRows: Array<{ 
    id_artist: string | null; 
    email?: string;
    name?: string;
    photo?: string | null; 
    instruments: Array<{ id_instrument: number; label: string }>; 
    availableInstruments: Array<{ id: number; instrument: string }>; 
    loadingInstruments: boolean;
    isNewArtist?: boolean;
  }> = [];

  // All requests data
  ardata: any = [];
  originalData: any = [];
  
  // Comment counts for events
  eventCommentCounts: Map<number, number> = new Map();
  
  // Search and sort
  searchQuery: string = '';
  sortColumn: string = 'created_on';
  sortDirection: 'asc' | 'desc' = 'desc';

  // View request details
  viewingRequest: any = null;
  isViewingRequest: boolean = false;
  newComment: string = '';
  isAddingComment: boolean = false;

  constructor(
    private fb: FormBuilder,
    private artistService: ArtistService,
    private eventService: EventService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize forms
    this.detailsForm = this.fb.group({
      id_event_domain: [null],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      teaser: ['', [Validators.maxLength(200)]],
      long_teaser: [''],
      description: ['', [Validators.required]]
    });

    this.datesForm = this.fb.group({
      dates: this.fb.array([])
    });

    this.imageForm = this.fb.group({
      credit_photo: ['']
    });

    this.mediaForm = this.fb.group({
      media: this.fb.array([])
    });

    this.artistsForm = this.fb.group({
      artists: this.fb.array([])
    });

    this.commentsForm = this.fb.group({
      comments: ['']
    });

    effect(() => {
      this.artistID = this.artistService.getArtistID();
    });
  }

  async ngOnInit(): Promise<void> {
    console.log('Component initializing...');
    
    try {
      // Get the authenticated user's ID directly from auth service
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        this.alertService.showAlert('Error', 'You must be logged in to access this page', 'error');
        return;
      }
      
      const authUserId = currentUser.id;
      console.log('Authenticated user ID:', authUserId);
      
      // Set the authID to use for created_by
      this.authID = authUserId;
      this.createdBy = authUserId;
      this.artistService.setArtistProfileID(authUserId);
      
      // Try to get the artist record using the auth user ID
      try {
        const artistProfile = await this.artistService.getArtistProfile_v2(authUserId);
        if (artistProfile && artistProfile.artist) {
          this.artistID = artistProfile.artist.id;
          this.artistService.setArtistID(this.artistID);
          console.log('Artist ID from artists table:', this.artistID);
        }
      } catch (error) {
        console.warn('Could not fetch artist record:', error);
      }
      
      console.log('Final IDs - Auth ID:', this.authID, 'Artist ID:', this.artistID);

      // Load dropdown data
      const [eventDomains, eventTypes, artists, instruments] = await Promise.all([
        this.eventService.listSysEventDomains(),
        this.eventService.listSysEventTypes(),
        this.eventService.getAvailableArtists(),
        this.eventService.listAllInstruments()
      ]);

      this.eventDomains = eventDomains || [];
      this.eventTypes = eventTypes || [];
      this.instruments = (instruments || []).map((r: any) => ({ 
        id: r.id, 
        instrument: r.instrument || r.name || '' 
      }));
      this.availableArtists = (artists || []).map((a: any) => ({
        id: (a.id || a.id_artist || a.artist_id || '').toString(),
        name: `${(a.fname || a.first_name || '').trim()} ${(a.lname || a.last_name || '').trim()}`.trim(),
        photo: a.photo || a.image || null,
        email: a.email || null
      })).filter((a: any) => a.id && a.id !== '');

    } catch (err: any) {
      console.error('Initialization error:', err);
      this.alertService.showAlert('Error', err.message || 'Failed to load data', 'error');
    }

    // Initialize with one date row
    if (this.eventDates.length === 0) this.addDate();
    
    // Load existing requests
    console.log('About to load requests...');
    await this.getRequest();
    console.log('Requests loaded. Count:', this.ardata?.length || 0);
    
    // Check if we need to edit a request (from navigation state)
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || (history.state);
    if (state && state['editRequestId']) {
      await this.editRequest(state['editRequestId']);
    }
  }

  // Convenience getters
  get eventDates(): FormArray { return this.datesForm.get('dates') as FormArray; }
  get mediaItems(): FormArray { return this.mediaForm.get('media') as FormArray; }
  get teaserLength(): number { return (this.detailsForm.get('teaser')?.value || '').length; }

  // Tab navigation
  isActiveTab(tab: number) {
    this.activeTab.set(tab);
    if (tab === 2) {
      this.currentStep = 1; // Reset to first step when creating new request
      this.isEditMode = false;
      this.createdRequestId = null;
    }
  }

  // Edit existing request
  async editRequest(eventId: number): Promise<void> {
    this.isLoadingData = true;
    this.isEditMode = true;
    this.createdRequestId = eventId;
    
    try {
      // Load event data
      await this.loadEventForEdit(eventId);
      
      // Switch to edit tab (New Request form)
      this.activeTab.set(2);
      this.currentStep = 1;
    } catch (error: any) {
      this.alertService.showAlert('Error', error.message || 'Failed to load event for editing', 'error');
      this.isEditMode = false;
      this.createdRequestId = null;
    } finally {
      this.isLoadingData = false;
    }
  }

  private async loadEventForEdit(eventId: number): Promise<void> {
    try {
      // Load base event
      const base = await this.eventService.getEventBase(eventId);
      
      // Patch details form
      this.detailsForm.patchValue({
        id_event_domain: base?.id_event_domain ?? null,
        title: base?.title ?? '',
        teaser: base?.teaser ?? '',
        long_teaser: base?.long_teaser ?? '',
        description: base?.description ?? ''
      });

      // Load and populate dates
      const dates = await this.eventService.getEventDates(eventId);
      this.eventDates.clear();
      if (dates && dates.length > 0) {
        dates.forEach((d: any) => {
          this.eventDates.push(this.buildDateGroup({
            start_date: d.start_date || '',
            end_date: d.end_date || '',
            time: '',
            flag: d.flag || ''
          }));
        });
      } else {
        this.addDate();
      }

      // Load image
      if (base?.photo) {
        this.uploadPreviewUrl = base.photo;
      }
      this.imageForm.patchValue({
        credit_photo: base?.credit_photo ?? ''
      });

      // Load media
      const media = await this.eventService.getEventMedia(eventId);
      this.mediaItems.clear();
      if (media && media.length > 0) {
        media.forEach((m: any) => {
          this.mediaItems.push(this.fb.group({
            id_media_type: [m.id_media_type || 1, Validators.required],
            title: [m.title || '', Validators.required],
            description: [m.description || ''],
            url: [m.url || ''],
            imageFile: [null],
            existingImageUrl: [m.image || null]
          }));
        });
      }

      // Load artists and instruments
      const pairs = await this.eventService.getEventArtistInstrumentPairs(eventId);
      this.artistRows = [];
      
      if (pairs && pairs.length > 0) {
        // Group by artist
        const artistMap = new Map<string, any>();
        
        for (const p of pairs) {
          const artistId = p.id_artist.toString();
          
          if (!artistMap.has(artistId)) {
            const artistMeta = this.availableArtists.find(a => a.id == artistId || a.id === artistId);
            artistMap.set(artistId, {
              id_artist: artistId,
              name: artistMeta?.name || `Artist ${artistId}`,
              photo: artistMeta?.photo || null,
              email: artistMeta?.email || '',
              instruments: [],
              availableInstruments: [],
              loadingInstruments: false,
              isNewArtist: !artistMeta
            });
          }
          
          const artist = artistMap.get(artistId);
          const instrumentName = p.instrument_name || 
            this.instruments.find((i: any) => i.id === Number(p.id_instrument))?.instrument || 
            'Unknown';
          
          artist.instruments.push({
            id_instrument: Number(p.id_instrument),
            label: instrumentName
          });
        }
        
        // Convert map to array and load available instruments for each
        for (const [artistId, artist] of artistMap) {
          try {
            const data = await this.eventService.getArtistInstruments(artistId);
            artist.availableInstruments = (data || []).map((r: any) => ({ 
              id: r.id_instrument || r.id, 
              instrument: r.instrument || r.name 
            }));
            console.log('Loaded instruments for artist', artistId, ':', artist.instruments, 'Available:', artist.availableInstruments);
          } catch (err) {
            console.error('Error loading instruments for artist:', artistId, err);
            artist.availableInstruments = [];
          }
          this.artistRows.push(artist);
        }
      }
      
      if (this.artistRows.length === 0) {
        this.addArtistRow();
      }

      // Load comments
      this.commentsForm.patchValue({
        comments: base?.comments ?? ''
      });

    } catch (err: any) {
      console.error('Error loading event for edit:', err);
      throw err;
    }
  }

  // ===================== DATES SECTION =====================
  private buildDateGroup(data?: Partial<{ start_date: string; end_date: string; time: string; flag: string }>): FormGroup {
    const group = this.fb.group({
      start_date: [data?.start_date || '', Validators.required],
      end_date: [data?.end_date || ''],
      time: [data?.time || ''],
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
      timeCtrl?.clearValidators();
      endCtrl?.clearValidators();
      if (endCtrl?.value) endCtrl.setValue('', { emitEvent: false });
      if (timeCtrl?.value) timeCtrl.setValue('', { emitEvent: false });
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

  addDate(): void {
    this.eventDates.push(this.buildDateGroup());
  }

  removeDate(index: number): void {
    this.eventDates.removeAt(index);
  }

  // ===================== IMAGE SECTION =====================
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

  // ===================== MEDIA SECTION =====================
  addMediaItem(id_media: 1 | 2 = 1): void {
    this.mediaItems.push(this.fb.group({
      id_media_type: [id_media, Validators.required],
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
    group.patchValue({ id_media_type: type });
  }

  onMediaImageSelected(event: any, index: number): void {
    const file: File | null = event?.target?.files?.[0] || null;
    if (!file) return;
    const group = this.mediaItems.at(index) as FormGroup;
    group.patchValue({ imageFile: file });
  }

  // ===================== ARTISTS SECTION =====================
  addArtistRow(): void {
    this.artistRows.push({ 
      id_artist: null, 
      instruments: [], 
      availableInstruments: [], 
      loadingInstruments: false,
      isNewArtist: false
    });
  }

  removeArtistRow(i: number): void {
    this.artistRows.splice(i, 1);
  }

  async onArtistSelected(i: number, id_artist: string | null): Promise<void> {
    const row = this.artistRows[i];
    row.id_artist = (id_artist && id_artist.length > 0) ? id_artist : null;
    row.instruments = [];
    row.availableInstruments = [];
    row.isNewArtist = false;
    
    if (!row.id_artist) return;

    row.loadingInstruments = true;
    try {
      const data = await this.eventService.getArtistInstruments(row.id_artist);
      row.availableInstruments = (data || []).map((r: any) => ({ 
        id: r.id_instrument || r.id, 
        instrument: r.instrument || r.name 
      }));
      const artistMeta = this.availableArtists.find(a => a.id === row.id_artist);
      row.photo = artistMeta?.photo || null;
      row.name = artistMeta?.name || '';
      row.email = artistMeta?.email || '';
    } catch (err) {
      console.error('Error loading instruments:', err);
    } finally {
      row.loadingInstruments = false;
    }
  }

  addRowInstrument(i: number, id_instrument: number): void {
    const row = this.artistRows[i];
    if (!row || !id_instrument) return;
    
    const label = (row.availableInstruments.find(ai => ai.id === id_instrument)?.instrument) || '';
    if (!row.instruments.some(x => x.id_instrument === id_instrument)) {
      row.instruments.push({ id_instrument, label });
    }
  }

  addRowInstrumentFromSelect(i: number, selectEl: HTMLSelectElement): void {
    const raw = selectEl.value;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return;
    
    const row = this.artistRows[i];
    if (!row) return;
    
    // For new artists or those with empty availableInstruments, use global instruments list
    const instrumentsList = (row.availableInstruments && row.availableInstruments.length > 0) 
      ? row.availableInstruments 
      : this.instruments;
    
    const instrumentName = instrumentsList.find(inst => inst.id === value)?.instrument || '';
    
    if (!row.instruments.some(x => x.id_instrument === value)) {
      row.instruments.push({ id_instrument: value, label: instrumentName });
    }
    
    selectEl.value = '' as any;
  }

  removeRowInstrument(i: number, id_instrument: number): void {
    const row = this.artistRows[i];
    if (!row) return;
    row.instruments = row.instruments.filter(x => x.id_instrument !== id_instrument);
  }

  // Check if artist is in available list
  isArtistInAvailableList(artistId: string): boolean {
    return this.availableArtists.some(a => a.id == artistId || a.id === artistId);
  }

  // New Artist with Email
  newArtistName: string = '';
  newArtistEmail: string = '';
  isAddingNewArtist: boolean = false;
  newSignupArtists: Array<{ name: string; email: string; id: string }> = [];

  async addNewArtist(): Promise<void> {
    if (!this.newArtistName || !this.newArtistEmail) {
      this.alertService.showAlert('Validation', 'Please provide name and email for the new artist', 'warning');
      return;
    }

    this.isAddingNewArtist = true;
    
    try {
      // Send signup email via Supabase
      await this.artistService.sendArtistSignupEmail(this.newArtistEmail, this.newArtistName);
      
      // Add to artist table
      const newArtistId = await this.artistService.addPendingArtist(this.newArtistName, this.newArtistEmail);
      
      // Add to new signup artists list
      this.newSignupArtists.push({
        name: this.newArtistName,
        email: this.newArtistEmail,
        id: newArtistId
      });
      
      // Add comment about new artist
      const currentComments = this.commentsForm.get('comments')?.value || '';
      const separator = currentComments ? '\n\n' : '';
      const newComment = `${separator}New artist (${this.newArtistEmail}) and (${this.newArtistName}) is required and sent for signup`;
      this.commentsForm.patchValue({ comments: currentComments + newComment });
      
      // Add to artist rows
      this.artistRows.push({
        id_artist: newArtistId,
        name: this.newArtistName,
        email: this.newArtistEmail,
        instruments: [],
        availableInstruments: this.instruments, // All instruments available for new artist
        loadingInstruments: false,
        isNewArtist: true
      });
      
      this.alertService.showAlert('Success', 'Signup email sent and artist added to request', 'success');
      this.newArtistName = '';
      this.newArtistEmail = '';
    } catch (error: any) {
      this.alertService.showAlert('Error', error.message || 'Failed to add new artist', 'error');
    } finally {
      this.isAddingNewArtist = false;
    }
  }

  // ===================== NAVIGATION =====================
  async nextStep(): Promise<void> {
    if (this.currentStep === 1) {
      // Validate Details
      if (this.detailsForm.invalid) {
        this.detailsForm.markAllAsTouched();
        this.alertService.showAlert('Validation', 'Please complete all required fields', 'warning');
        return;
      }
      
      try {
        this.isSaving = true;
        const d = this.detailsForm.value;
        
        if (this.isEditMode && this.createdRequestId) {
          // Update existing event
          await this.eventService.updateEventRow(this.createdRequestId, {
            title: d.title,
            teaser: d.teaser || null,
            long_teaser: d.long_teaser || null,
            id_event_domain: d.id_event_domain || null,
            description: d.description
          });
        } else {
          // Create new event request with status 2
          this.createdRequestId = await this.eventService.createEventRow({
            title: d.title,
            teaser: d.teaser || null,
            long_teaser: d.long_teaser || null,
            id_event_domain: d.id_event_domain || null,
            id_event_type: 1, // Default type for requests
            description: d.description,
            booking_url: null,
            photo: null,
            credit_photo: null,
            status: 2, // Status 2 for all event requests
            is_active: false,
            id_edition: null
          });
        }
        
        this.currentStep = 2;
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save request', 'error');
        return;
      } finally {
        this.isSaving = false;
      }
    } else if (this.currentStep === 2) {
      // Validate and save Dates
      if (this.eventDates.length === 0 || this.eventDates.invalid) {
        this.eventDates.markAllAsTouched();
        this.alertService.showAlert('Validation', 'Please add at least one date', 'warning');
        return;
      }
      
      try {
        this.isSaving = true;
        const rows = (this.eventDates.value as Array<any>).map(x => {
          const isPeriod = x.flag === 'p';

          return {
            start_date: x.start_date,
            end_date: isPeriod ? (x.end_date || null) : (x.start_date || null),
            time: null,
            id_location: null,
            flag: x.flag || null
          };
        });
        await this.eventService.replaceEventDates(this.createdRequestId!, rows);
        this.currentStep = 3;
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save dates', 'error');
        return;
      } finally {
        this.isSaving = false;
      }
    } else if (this.currentStep === 3) {
      // Save Image
      try {
        this.isSaving = true;
        if (this.mainImageFile) {
          const photoUrl = await this.eventService.uploadEventImage(this.mainImageFile);
          const creditPhoto = this.imageForm.get('credit_photo')?.value || null;
          await this.eventService.updateEventRow(this.createdRequestId!, { 
            photo: photoUrl,
            credit_photo: creditPhoto
          });
          this.uploadPreviewUrl = photoUrl;
        }
        this.currentStep = 4;
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save image', 'error');
      } finally {
        this.isSaving = false;
      }
    } else if (this.currentStep === 4) {
      // Save Media
      try {
        this.isSaving = true;
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
        await this.eventService.replaceEventMedia(this.createdRequestId!, payload);
        this.currentStep = 5;
      } catch (err: any) {
        this.alertService.showAlert('Error', err.message || 'Failed to save media', 'error');
      } finally {
        this.isSaving = false;
      }
    } else if (this.currentStep === 5) {
      // Save Artists - Allow skipping if no valid artists or if artists are pending activation
      try {
        this.isSaving = true;
        
        // Filter out artists that have valid IDs (not new/pending artists)
        const validArtistRows = this.artistRows.filter(row => 
          row.id_artist && !row.isNewArtist
        );
        
        // Only process if there are valid artists
        if (validArtistRows.length > 0) {
          for (const row of validArtistRows) {
            // Ensure id_artist is not null before using it
            if (!row.id_artist) continue;
            
            const artistId = row.id_artist; // Type guard
            
            try {
              await this.eventService.ensureEventArtist(this.createdRequestId!, artistId);
              
              // Add instruments if any are selected
              if (row.instruments && row.instruments.length > 0) {
                for (const inst of row.instruments) {
                  await this.eventService.addEventInstrument(this.createdRequestId!, artistId, inst.id_instrument);
                }
              }
            } catch (instErr) {
              // Log but don't fail - artist might not have instruments yet
              console.warn(`Could not add instruments for artist ${artistId}:`, instErr);
            }
          }
        }
        
        // Always proceed to next step, even if no artists were processed
        this.currentStep = 6;
      } catch (err: any) {
        console.error('Error in artists step:', err);
        // Still proceed to next step to allow completion
        this.currentStep = 6;
      } finally {
        this.isSaving = false;
      }
    }
  }

  backStep(): void {
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as any;
    }
  }

  async submitEventRequest(): Promise<void> {
    try {
      this.isSaving = true;
      
      // Save comments to the event_comments table with who = 2 (artist)
      const comments = this.commentsForm.get('comments')?.value || '';
      if (this.createdRequestId && comments && comments.trim()) {
        await this.artistService.addEventComment(
          this.createdRequestId,
          null, // no host ID for artist comments
          comments.trim(),
          this.artistID
        );
      }
      
      const message = this.isEditMode 
        ? 'Event request updated successfully!' 
        : 'Event request submitted successfully!';
      this.alertService.showAlert('Success', message, 'success');
      
      // Reset form and go to "All Requests" tab
      this.resetForm();
      this.activeTab.set(1);
      await this.getRequest();
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to submit request', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  resetForm(): void {
    this.currentStep = 1;
    this.createdRequestId = null;
    this.isEditMode = false;
    this.detailsForm.reset();
    this.datesForm.reset();
    this.imageForm.reset();
    this.mediaForm.reset();
    this.artistsForm.reset();
    this.commentsForm.reset();
    this.eventDates.clear();
    this.mediaItems.clear();
    this.artistRows = [];
    this.newSignupArtists = [];
    this.uploadPreviewUrl = null;
    this.mainImageFile = null;
    this.addDate();
  }

  cancelEdit(): void {
    this.resetForm();
    this.activeTab.set(1); // Go back to "All Requests" tab
  }

  // ===================== ALL REQUESTS =====================
  async getRequest(): Promise<void> {
    this.isLoadingRequests = true;
    try {
      console.log('Loading requests for auth ID:', this.authID);
      
      if (!this.authID) {
        console.warn('Auth ID is not set, cannot load requests');
        this.alertService.showAlert('Info', 'Unable to load requests. Please log in again.', 'info');
        this.ardata = [];
        this.originalData = [];
        return;
      }
      
      // Get all event requests created by this user (all statuses)
      // Use authID because events.created_by is the auth user ID
      const data = await this.eventService.getEventsByArtist(this.authID);
      console.log('Loaded requests count:', data?.length || 0);
      console.log('Requests data:', data);
      this.originalData = data;
      this.ardata = [...data];
      
      // Fetch comment counts for all events
      await this.loadCommentCounts();
      
      // Apply initial search and sort
      this.applySearchAndSort();
    } catch (error: any) {
      console.error('Error loading requests:', error);
      this.alertService.showAlert('Error', 'Failed to load event requests: ' + error.message, 'error');
      this.ardata = [];
      this.originalData = [];
    } finally {
      this.isLoadingRequests = false;
    }
  }

  // Load comment counts for all events
  async loadCommentCounts(): Promise<void> {
    this.eventCommentCounts.clear();
    
    if (!this.originalData || this.originalData.length === 0) {
      return;
    }
    
    try {
      // Fetch comment counts for all events in parallel
      const countPromises = this.originalData.map((event: any) => 
        this.artistService.getEventCommentCount(event.id)
          .then(count => ({ eventId: event.id, count }))
          .catch(err => {
            console.error(`Failed to get comment count for event ${event.id}:`, err);
            return { eventId: event.id, count: 0 };
          })
      );
      
      const results = await Promise.all(countPromises);
      
      // Store counts in map
      results.forEach(result => {
        this.eventCommentCounts.set(result.eventId, result.count);
      });
      
      console.log('Loaded comment counts:', this.eventCommentCounts);
    } catch (error) {
      console.error('Error loading comment counts:', error);
    }
  }

  // Check if event has more than 2 comments
  hasMultipleComments(eventId: number): boolean {
    const count = this.eventCommentCounts.get(eventId) || 0;
    return count > 2;
  }

  // Get comment count for event
  getCommentCount(eventId: number): number {
    return this.eventCommentCounts.get(eventId) || 0;
  }

  statusReturn(id: any): string {
    switch(id) {
      case 0: return 'Published as Event';
      case 1: return 'Approved Request';
      case 2: return 'Pending';
      case 3: return 'On Hold';
      case 4: return 'New Message';
      case 5: return 'New Message';
      case 6: return 'Rejected';
      default: return 'Unknown';
    }
  }

  getStatusLabel(status: number | undefined | null): string {
    switch (status) {
      case 0: return 'Published as Event';
      case 1: return 'Approved Request';
      case 2: return 'Pending';
      case 3: return 'On Hold';
      case 4: return 'New Message';
      case 5: return 'New Message';
      case 6: return 'Rejected';
      default: return String(status ?? '');
    }
  }

  // Status filter - tracks current status filter
  currentStatusFilter: number = 4; // 4 means "All"
  
  getDataByStatus(status: number): void {
    this.currentStatusFilter = status;
    this.applySearchAndSort();
  }

  // Search functionality
  onSearchChange(): void {
    this.applySearchAndSort();
  }

  // Sort functionality
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to ascending for new column
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySearchAndSort();
  }

  // Apply search and sort
  private applySearchAndSort(): void {
    if (!this.originalData || !Array.isArray(this.originalData)) {
      console.warn('originalData is not an array:', this.originalData);
      this.ardata = [];
      return;
    }

    let filtered = [...this.originalData];
    console.log('Applying filters. Original count:', filtered.length, 'Status filter:', this.currentStatusFilter);

    // Apply status filter first
    if (this.currentStatusFilter !== 4) {
      filtered = filtered.filter((item: any) => item.status === this.currentStatusFilter);
      console.log('After status filter:', filtered.length);
    }

    // Apply search filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((event: any) => 
        event.title?.toLowerCase().includes(query)
      );
      console.log('After search filter:', filtered.length);
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortColumn) {
        case 'title':
          valueA = a.title?.toLowerCase() || '';
          valueB = b.title?.toLowerCase() || '';
          break;
        case 'event_domain':
          valueA = a.event_domain?.toLowerCase() || '';
          valueB = b.event_domain?.toLowerCase() || '';
          break;
        case 'created_on':
          valueA = new Date(a.created_on).getTime();
          valueB = new Date(b.created_on).getTime();
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.ardata = filtered;
    console.log('Final ardata count:', this.ardata.length);
  }

  // Clear search
  clearSearch(): void {
    this.searchQuery = '';
    this.applySearchAndSort();
  }

  async delArtistRequest(id: any): Promise<void> {
    const confirmed = await this.alertService.confirmDelete(
      'Delete Request?',
      'Are you sure you want to revoke this event request?',
      'Yes, revoke it!'
    );
    
    if (!confirmed) return;

    try {
      await this.eventService.deleteEvent(id);
      this.alertService.showAlert('Success', 'Request revoked successfully', 'success');
      this.ardata = this.ardata.filter((data: { id: any; }) => data.id !== id);
    } catch (error: any) {
      this.alertService.showAlert('Error', error.message || 'Failed to revoke request', 'error');
    }
  }

  // View request details with comments
  async viewRequestDetails(eventId: number): Promise<void> {
    try {
      this.isViewingRequest = true;
      const details = await this.artistService.get_single_request_with_details_v1(eventId);
      this.viewingRequest = Array.isArray(details) && details.length > 0 ? details[0] : details;
      console.log('Viewing Request:', this.viewingRequest);
    } catch (error: any) {
      console.error('Error loading request details:', error);
      this.alertService.showAlert('Error', 'Failed to load request details', 'error');
    }
  }

  closeRequestView(): void {
    this.isViewingRequest = false;
    this.viewingRequest = null;
    this.newComment = '';
  }

  // Add comment to request
  async addCommentToRequest(): Promise<void> {
    if (!this.newComment.trim() || !this.viewingRequest?.id) return;
    
    try {
      this.isAddingComment = true;
      
      // Add comment with who = 1 for artist
      await this.artistService.addEventComment(
        this.viewingRequest.id,
        null, // no host ID for artist comments
        this.newComment.trim(),
        this.artistID
      );
      
      // Reload request details to get updated comments
      await this.viewRequestDetails(this.viewingRequest.id);
      
      // Clear the input
      this.newComment = '';
      
      this.alertService.showAlert('Success', 'Comment added successfully', 'success');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      this.alertService.showAlert('Error', 'Failed to add comment', 'error');
    } finally {
      this.isAddingComment = false;
    }
  }
}
