import { CommonModule, NgClass, NgFor, NgForOf, NgIf } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { ArtistRequest, ArtistService } from '../../../services/artist.service';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-request',
  imports: [FormsModule, NgClass, NgForOf,NgFor, CommonModule],
  templateUrl: './request.component.html',
})
export class RequestComponent {
  // Use signal for activeTab
  activeTab = signal(2);

  // Declare artistID as a signal
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
  eventTitle = signal('');                      // Event Title
  sysInstruments: any[] = [];                   // System Instruments       
  artistID:any= [];                             // Artist ID
  selectedInstrument: string = '';              // Selected Instrument
  selectedInstruments: { name: string; color: string }[] = [];
  selectedDate: string = '';                    // Selected Date
  proposedDates: string[] = [];                 // Proposed Dates  
  shortDescription = signal('');                // Short Description
  longDescription = signal('');                 // Long Description
  selectedRequestType: number | null = null;    // Selected Request Type 
selectedFile: File | null = null;
            // Selected File for upload
 
  constructor(
    private artistService: ArtistService, 
    private alertService: AlertService) {
     effect(() => {
    this.artistID = this.artistService.getArtistID();
  });
  }


  ngOnInit(): void {
    this.getInstrumentName();
  }


 // Get Instrument Names
  // This method fetches the list of instruments from the service
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

// Method to add Instrument
  // This method adds the selected instrument to the list of selected instruments
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

// Method to add proposed date
  // This method adds the selected date to the list of proposed dates
  addProposedDate() {
    if (this.selectedDate && !this.proposedDates.includes(this.selectedDate)) {
      this.proposedDates.push(this.selectedDate);
      this.selectedDate = ''; // Clear input after adding
    }
  }

  // Next step method that validates and updates activeTab 
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

// Method to switch New Request and All Requests tabs

  isActiveTab(tab: number) {
    this.activeTab.set(tab);  
  };

  //Method to upload the image and save data
  onFileChange(event: any) {
 const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
  } else {
    this.selectedFile = null;
  }  
}

  videoTitle:any;
  videoUrl:any;
  idRequest:any = 1;
  createdBy:any = '409ced25-d7b5-4d8d-a644-7392d0908736'; // Example user ID
  authID:any = '409ced25-d7b5-4d8d-a644-7392d0908736';

async upload() {
  this.videoUpload = true;

  const result = await this.artistService.uploadImageAndSaveData(
    this.selectedFile ?? null, // allow null file
    this.videoTitle,
    this.videoUrl,
    this.idRequest,
    this.createdBy,
    this.authID
  );

  this.videoUpload = false;

  if (result.success) {
    console.log('Upload successful:', result.imageUrl);

    // Add to video list
    this.videoList.push({
      title: this.videoTitle,
      id: result.id,
    });

    // ✅ Clear the input fields
    this.videoTitle = '';
    this.videoUrl = '';
    this.selectedFile = null;

    // ✅ Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

  } else {
    console.error('Upload error:', result.error);
  }
}



  videoList: any[] = []; // List to hold uploaded videos
removeUpload(id: number) {
  this.videoList = this.videoList.filter(video => video.id !== id);
  console.log(`Removed video with ID: ${id}`);  
}
videoUpload:any = false; // Signal to track upload state

}
