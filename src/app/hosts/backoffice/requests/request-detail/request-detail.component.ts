import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../../../../services/artist.service';
import { EventService } from '../../../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './request-detail.component.html'
})
export class RequestDetailComponent implements OnInit {
  requestArr: any;
  eventDetails: any;
  videos: any[] = [];
  cds: any[] = [];
  activeTab: 'details' | 'dates' | 'image' | 'media' | 'artists' | 'comments' = 'details';
  commentText: string = '';
  isSubmitting: boolean = false;
  newComment: string = '';
  isAddingComment: boolean = false;

  constructor(
    private artistService: ArtistService,
    private eventService: EventService,
    private route: ActivatedRoute, 
    private router: Router,
    private alertService: AlertService
  
  ) {

  }

  loggedUser:any;
  hostId: number | null = null;
  
  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.getRequestDetail(params['id']);
    });
    
    // Get the profile ID
    this.loggedUser = this.artistService.getLoggedUserID();
    console.log('Logged user profile ID:', this.loggedUser);
    
    // Get the host ID from host_users table
    if (this.loggedUser) {
      try {
        this.hostId = await this.artistService.getHostIdFromProfile(this.loggedUser);
        console.log('Host ID from host_users table:', this.hostId);
      } catch (error) {
        console.error('Error getting host ID from host_users table:', error);
        this.alertService.showAlert('Warning', 'Could not load host profile. Some features may be limited.', 'warning');
      }
    } else {
      console.warn('Logged user profile ID is not set');
    }
  }

  getRequestDetail(p0: any){
    this.artistService.getRequestDetail(p0).then(res => {
      // Handle the response - it should be an array with event details
      const responseData = Array.isArray(res) && res.length > 0 ? res[0] : res;
      
      this.requestArr = responseData;
      this.eventDetails = responseData;
      
      console.log('Request/Event Details:', this.eventDetails);
      
      // Handle event media if present
      const mediaArr: any[] = Array.isArray(this.eventDetails?.event_media) ? this.eventDetails.event_media : [];
      this.videos = mediaArr.filter((m: any) => {
        const t = m?.id_media_type ?? m?.id_media ?? m?.type;
        return t === 1 || t === 'video';
      });
      this.cds = mediaArr.filter((m: any) => {
        const t = m?.id_media_type ?? m?.id_media ?? m?.type;
        return t === 2 || t === 'cd';
      });
      
      // Comments is now an array, no need to set commentText here
      // commentText is only for status update actions
    }).catch(err => {
      console.log('Error loading details:', err);
    }); 
  }


  getStatusLabel(status: number | undefined | null): string {
    switch (status) {
      case 0: return 'Published';
      case 1: return 'Approved';
      case 2: return 'New';
      case 3: return 'On Hold';
      case 6: return 'Rejected';
      default: return String(status ?? '');
    }
  }
  

  async statusRequest(status: number) {
    if (!this.eventDetails?.id) return;
    
    try {
      this.isSubmitting = true;
      
      // Update status in events table
      await this.eventService.updateEventRow(this.eventDetails.id, {
        status: status
      });
      
      // Update local event details
      this.eventDetails.status = status;
      
      // Show appropriate alert and navigate
      if (status === 1) {
        this.alertService.showAlert('Approved', 'The request has been approved', 'success');
      } else if (status === 3) {
        this.alertService.showAlert('On Hold', 'The request has been placed on hold', 'warning');
      } else if (status === 6) {
        this.alertService.showAlert('Rejected', 'The request has been rejected', 'error');
      }
      
      this.router.navigate(['hosts/console/requests']);
    } catch (error: any) {
      console.error('Error updating status:', error);
      this.alertService.showAlert('Error', error.message || 'Failed to update status', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

async addComment() {
  if (!this.newComment.trim() || !this.eventDetails?.id) return;
  
  try {
    this.isAddingComment = true;
    
    // Try to get host ID if not already loaded
    if (!this.hostId && this.loggedUser) {
      console.log('Attempting to fetch host ID for profile:', this.loggedUser);
      try {
        this.hostId = await this.artistService.getHostIdFromProfile(this.loggedUser);
        console.log('Successfully fetched host ID:', this.hostId);
      } catch (err) {
        console.error('Failed to fetch host ID:', err);
      }
    }
    
    // Check if we have the host ID
    if (!this.hostId) {
      console.error('Host ID is null. Logged user:', this.loggedUser);
      this.alertService.showAlert('Error', 'Host ID not found in host_users table. Please ensure your host profile is set up correctly.', 'error');
      return;
    }
    
    // Get first artist ID if available
    const artistId = this.eventDetails?.event_artists?.length > 0 
      ? this.eventDetails.event_artists[0].id_artist 
      : null;
    
    console.log('Adding comment with:', { eventId: this.eventDetails.id, hostId: this.hostId, artistId });
    
    // Pass the integer host ID from host_users table, not the profile UUID
    await this.artistService.addEventComment(
      this.eventDetails.id,
      this.hostId,  // Use the integer ID from host_users table
      this.newComment.trim(),
      artistId
    );
    
    // Refresh the event details to get updated comments
    await this.getRequestDetail(this.eventDetails.id);
    
    // Clear the input
    this.newComment = '';
    
    this.alertService.showAlert('Success', 'Comment added successfully', 'success');
  } catch (error: any) {
    console.error('Error adding comment:', error);
    this.alertService.showAlert('Error', 'Failed to add comment: ' + error.message, 'error');
  } finally {
    this.isAddingComment = false;
  }
}

}
