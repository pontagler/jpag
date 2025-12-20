import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../../../services/artist.service';
import { EventService } from '../../../services/event.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-request-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './request-view.component.html'
})
export class RequestViewComponent implements OnInit {
  requestId!: number;
  requestDetails: any = null;
  isLoading: boolean = true;
  activeTab: 'details' | 'dates' | 'image' | 'media' | 'artists' | 'comments' = 'details';
  
  // Edit mode
  isEditMode: boolean = false;
  isSaving: boolean = false;
  
  // Comments
  newComment: string = '';
  isAddingComment: boolean = false;
  
  // Artist info
  artistID: any;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService,
    private eventService: EventService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {
    this.artistID = this.artistService.getArtistID();
    
    this.route.params.subscribe(async params => {
      this.requestId = +params['id'];
      if (this.requestId) {
        await this.loadRequestDetails();
      }
    });
  }

  async loadRequestDetails(): Promise<void> {
    try {
      this.isLoading = true;
      const details = await this.artistService.get_single_request_with_details_v2(this.requestId);
      this.requestDetails = Array.isArray(details) && details.length > 0 ? details[0] : details;
      console.log('Request Details:', this.requestDetails);
    } catch (error: any) {
      console.error('Error loading request details:', error);
      this.alertService.showAlert('Error', 'Failed to load request details', 'error');
      this.router.navigate(['/artist/profile/requests']);
    } finally {
      this.isLoading = false;
    }
  }

  canEdit(): boolean {
    // Can edit only if status is 2 (New) or 3 (On Hold)
    return this.requestDetails?.status === 2 || this.requestDetails?.status === 3;
  }

  toggleEditMode(): void {
    if (this.canEdit()) {
      this.isEditMode = !this.isEditMode;
    }
  }

  goBack(): void {
    this.router.navigate(['/artistspace/profile/requests']);
  }

  editRequest(): void {
    // Navigate to edit mode in the request component
    this.router.navigate(['/artistspace/profile/requests'], { 
      state: { editRequestId: this.requestId } 
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

  // Add comment
  async addComment(): Promise<void> {
    if (!this.newComment.trim() || !this.requestDetails?.id) return;
    
    try {
      this.isAddingComment = true;
      
      await this.artistService.addEventComment(
        this.requestDetails.id,
        null,
        this.newComment.trim(),
        this.artistID
      );
      
      // Reload request details
      await this.loadRequestDetails();
      
      // Clear input
      this.newComment = '';
      
      this.alertService.showAlert('Success', 'Comment added successfully', 'success');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      this.alertService.showAlert('Error', 'Failed to add comment', 'error');
    } finally {
      this.isAddingComment = false;
    }
  }

  async deleteRequest(): Promise<void> {
    const confirmed = await this.alertService.confirmDelete(
      'Delete Request?',
      'Are you sure you want to delete this event request?',
      'Yes, delete it!'
    );
    
    if (!confirmed) return;

    try {
      await this.eventService.deleteEvent(this.requestId);
      this.alertService.showAlert('Success', 'Request deleted successfully', 'success');
      this.router.navigate(['/artist/profile/requests']);
    } catch (error: any) {
      this.alertService.showAlert('Error', error.message || 'Failed to delete request', 'error');
    }
  }
}
