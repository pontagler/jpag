import { CommonModule, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { ArtistRequest, ArtistService } from '../../../services/artist.service';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-request',
  imports: [FormsModule, NgClass, NgIf, NgForOf, CommonModule],
  templateUrl: './request.component.html',
})
export class RequestComponent {
  // Use signal for activeTab
  activeTab = signal(1);

  constructor(private artistService: ArtistService, private alertService: AlertService) {
     effect(() => {
    this.artistID = this.artistService.getArtistID();
   
  });
  }
artistID:any= [];
  ngOnInit(): void {
    this.getInstrumentName();
  }

  events = [
    {
      title: 'Concert Cloud Nine',
      status: 'Pending',
      eventDate: '25 Aug 2025',
      submittedDate: '25 Aug 2025',
    },
    {
      title: 'Jazz Night Live',
      status: 'Approved',
      eventDate: '28 Aug 2025',
      submittedDate: '26 Aug 2025',
    },
  ];

  requestType = [
    { id: 1, name: 'Concert' },
    { id: 2, name: 'Exhibition' },
  ];

  eventTitle = signal('');

  sysInstruments: any[] = [];

  async getInstrumentName() {
    console.log('Fetching instruments...');
    this.artistService.getInstruments().subscribe({
      next: (data: any) => {
        this.sysInstruments = data;
        console.log('Fetched instruments:', this.sysInstruments);
      },
      error: (err) => {
        console.error('Error fetching instruments:', err);
      },
    });
  }

  selectedInstrument: string = '';
  selectedInstruments: { name: string; color: string }[] = [];

  addInstrument() {
    const instrument = this.sysInstruments.find(
      (i: any) => i.name === this.selectedInstrument
    );

    if (
      instrument &&
      !this.selectedInstruments.some((i) => i.name === instrument.name)
    ) {
      this.selectedInstruments.push({
        name: instrument.name,
        color: instrument.color,
      });

      this.selectedInstrument = ''; // Reset selection
    }
  }

  selectedDate: string = '';
  proposedDates: string[] = [];

  addProposedDate() {
    if (this.selectedDate && !this.proposedDates.includes(this.selectedDate)) {
      this.proposedDates.push(this.selectedDate);
      this.selectedDate = ''; // Clear input after adding
    }
  }

  shortDescription = signal('');
  longDescription = signal('');

  // Next step method that validates and updates activeTab


  selectedRequestType: number | null = null;


  
canProceed() {
  return (
    this.selectedRequestType != null &&
    this.eventTitle().trim().length > 0 &&
    this.selectedInstruments.length > 0 &&
    this.shortDescription().length <= 100 &&
    this.longDescription().length <= 200
  );
}

  async nextStep() {
    
    if (!this.canProceed()) {
      this.alertService.showAlert('Validation', 'Please fill all required fields and respect max lengths', 'error');
      return;
    }

    const id_artist = this.artistID; // Replace with real user ID from auth
    const id_host = '116ad27e-45bd-48d7-a2f7-096f8418ea65';  // Same

    const request: ArtistRequest = {
      id_artist,
     id_req_type: this.selectedRequestType ?? 1,  
      title: this.eventTitle(),
      instrument: this.selectedInstruments.map(i => i.name),
      short_desc: this.shortDescription(),
      long_desc: this.longDescription(),
      propose_date: this.proposedDates, // e.g. ['2025-04-05', '2025-04-06']
      id_host
    };

    try {
      await this.artistService.createArtistRequest(request).then((response) => {
        console.log('Request created successfully:', response);
      });
     
      this.activeTab.set(2);
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      this.alertService.showAlert('Error', error.message || 'Submission failed.', 'error');
    }
  }



}
