import { CommonModule, NgClass, NgFor, NgForOf, NgIf } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { ArtistRequest, ArtistService } from '../../../services/artist.service';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-request',
  imports: [FormsModule, NgClass, NgForOf, NgFor, CommonModule],
  templateUrl: './request.component.html',
})
export class RequestComponent {
  // Use signal for activeTab
  activeTab = signal(4);

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
  eventTitle = signal(''); // Event Title
  sysInstruments: any[] = []; // System Instruments
  artistID: any = []; // Artist ID
  selectedInstrument: string = ''; // Selected Instrument
  selectedInstruments: { name: string; color: string }[] = [];
  selectedDate: string = ''; // Selected Date
  proposedDates: string[] = []; // Proposed Dates
  shortDescription = signal(''); // Short Description
  longDescription = signal(''); // Long Description
  selectedRequestType: number | null = null; // Selected Request Type
  selectedFile: File | null = null;
  selectedFileCD: File | null = null;
  videoTitle: any;
  videoUrl: any;
  idRequest: any;
  createdBy: any;
  authID: any;
  videoUpload: any = false; // Signal to track upload state
  cdUpload: any = false;
  isRemoving: any; // Signal to track removal state
  isRemoving1: any; // Signal to track removal state
  videoList: any[] = []; // List to hold uploaded videos
  cdList: any[] = []; // List to hold uploaded videos
  cdTitle: any;
  cdUrl: any;
  originalData: any;

  // Selected File for upload

  constructor(
    private artistService: ArtistService,
    private alertService: AlertService
  ) {
    effect(() => {
      this.artistID = this.artistService.getArtistID();
    });
  }

  ngOnInit(): void {
    this.getInstrumentName();
    console.log('artist ID', this.artistService.getArtistID());
    this.artistID = this.artistService.getArtistID()
    console.log('profile ID', this.artistService.getArtistProfileID());
    this.authID = this.artistService.getArtistProfileID();
    this.createdBy = this.authID;
    this.getRequest();
  }

  userProfileID: any;

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
      this.alertService.showAlert(
        'Validation',
        'Please fill all required fields and respect max lengths',
        'error'
      );
      return;
    }

    const id_artist = this.artistID; // Replace with real user ID from auth
    const id_host = '1'; // Same

    const request: ArtistRequest = {
      id_artist,
      id_req_type: this.selectedRequestType ?? 1,
      title: this.eventTitle(),
      instrument: this.selectedInstruments.map((i) => i.name),
      short_desc: this.shortDescription(),
      long_desc: this.longDescription(),
      propose_date: this.proposedDates, // e.g. ['2025-04-05', '2025-04-06']
      id_host,
    };

    try {
      await this.artistService.createArtistRequest(request).then((response) => {
        console.log('Request created successfully:', response);
        this.idRequest = response.id;
      });

      this.activeTab.set(2);
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      this.alertService.showAlert(
        'Error',
        error.message || 'Submission failed.',
        'error'
      );
    }
  }

  // Method to switch New Request and All Requests tabs

  isActiveTab(tab: number) {
    this.activeTab.set(tab);
  }

  //Method to upload the image and save data
  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  //Method to upload the image and save data
  onFileChangeCD(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileCD = input.files[0];
    } else {
      this.selectedFileCD = null;
    }
  }

  async upload(id: any) {
    this.videoUpload = true;

    const result = await this.artistService.uploadImageAndSaveData(
      this.selectedFile ?? null, // allow null file
      this.videoTitle,
      this.videoUrl,
      this.idRequest,
      this.createdBy,
      this.authID,
      id
    );

    this.videoUpload = false;

    if (result.success) {
      console.log('Upload successful:', result.imageUrl);

      if (id == 1) {
        // Add to video list
        this.videoList.push({
          title: this.videoTitle,
          id: result.id,
        });
      } else {
        this.cdList.push({
          title: this.videoTitle,
          id: result.id,
        });
      }

      // ✅ Clear the input fields
      this.videoTitle = '';
      this.videoUrl = '';
      this.selectedFile = null;

      // ✅ Reset file input
      const fileInput = document.getElementById(
        'fileInput'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } else {
      console.error('Upload error:', result.error);
    }
  }

  async removeUpload(id: number, idType: any) {
    if (idType == 1) {
      this.isRemoving = id; // Set removing state to true
    } else {
      this.isRemoving1 = id; // Set removing state to true
    }
    const result = await this.artistService.deleteMedia(id);
    if (result.success) {
      console.log('Video deleted successfully!');
      if (idType == 1) {
        // this.isRemoving = false; // Reset removing state

        this.videoList = this.videoList.filter((video) => video.id !== id);
      } else {
        //   this.isRemoving1 = false; // Reset removing state

        this.cdList = this.cdList.filter((cd) => cd.id !== id);
      }
    } else {
      console.error('Delete failed:', result.error);
    }
  }

  async uploadCD(id: any) {
    this.cdUpload = true;

    const result = await this.artistService.uploadImageAndSaveData(
      this.selectedFileCD ?? null, // allow null file
      this.cdTitle,
      this.cdUrl,
      this.idRequest,
      this.createdBy,
      this.authID,
      id
    );

    if (result.success) {
      console.log('Upload successful:', result.imageUrl);

      this.cdUpload = false;
      this.cdList.push({
        title: this.cdTitle,
        id: result.id,
      });

      // ✅ Clear the input fields
      this.cdTitle = '';
      this.cdUrl = '';
      this.selectedFileCD = null;

      // ✅ Reset file input
      const fileInputCD = document.getElementById(
        'fileInputCD'
      ) as HTMLInputElement;
      if (fileInputCD) {
        fileInputCD.value = '';
      }
    } else {
      console.error('Upload error:', result.error);
    }
  }

  submitRequest() {
    this.activeTab.set(3);
  }
ardata:any = [];

  async getRequest(){
    // console.log('This is artist ID',this.artistID);
this.ardata = await this.artistService.getArtistRequests(this.artistID);
this.originalData = this.ardata;
    console.log('This is artist request',this.ardata);
  }

statusReturn(id:any){
  switch(id){
    case 1:
      return 'Pending';
      break;
    case 2:
      return 'Approved';
      break;
    case 3: 
      return 'Rejected';
      break;
    default:
        return '';

  }



}


getDataByStatus(status: number) {
  console.log('Status:', status);

  if (status === 4) {
    // Reload original data from backup if needed
    this.ardata = [...this.originalData]; // assuming you stored the original
  } else {
    this.ardata = this.originalData.filter((item: { status: number }) => item.status === status);
  }

  console.log('Updated ardata:', this.ardata);
}

async delArtistRequest(id:any){
await this.artistService.delArtistRequest(id).then(()=>{
  this.alertService.showAlert('Request Deleted', 'request has been removed', 'success');
  this.ardata = this.ardata.filter((data: { id: any; }) => data.id !== id);
  
}).catch(error=>{
  this.alertService.showAlert('Internal Error', error, 'error');
})
}
}
