import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../../../../services/artist.service';
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
  videos: any[] = [];
  cds: any[] = [];
  activeTab: 'details' | 'media' | 'comments' = 'details';
  commentText: string = '';
  isSubmitting: boolean = false;

  constructor(
    private artistService: ArtistService, 
    private route: ActivatedRoute, 
    private router: Router,
    private alertService: AlertService
  
  ) {

  }

  loggedUser:any;
  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.getRequestDetail(params['id']);
    });
        this.loggedUser = this.artistService.getLoggedUserID();

  }

  getRequestDetail(p0: any){
    this.artistService.getRequestDetail(p0).then(res => {
      this.requestArr = res;
      console.log(this.requestArr);
      const mediaArr: any[] = Array.isArray(this.requestArr?.media) ? this.requestArr.media : [];
      this.videos = mediaArr.filter((m: any) => {
        const t = m?.id_media_type ?? m?.id_media;
        return t === 1;
      });
      this.cds = mediaArr.filter((m: any) => {
        const t = m?.id_media_type ?? m?.id_media;
        return t === 2;
      });
      const existingComment = this.requestArr?.comments ?? this.requestArr?.comment ?? '';
      this.commentText = existingComment || '';
    }).catch(err => {
      console.log(err);
    }); 
  }

  async approve() {
    if (!this.requestArr?.id) return;
    try {
      this.isSubmitting = true;
      await this.artistService.updateRequestStatus(this.requestArr.id, 2, this.commentText || null);
      this.requestArr.status = 2;
      if (this.commentText) {
        this.requestArr.comment = this.commentText;
        this.requestArr.comments = this.commentText;
      }
      this.requestArr.last_status_change = new Date().toISOString();
    } catch (e) {
      console.error(e);
    } finally {
      this.isSubmitting = false;
    }
  }

  async approveAndCreateEvent() {
    await this.approve();
    // Navigate to events page (adjust route if a dedicated create page exists)
    this.router.navigate(['/hosts/console/events']);
  }

  async reject() {
    if (!this.requestArr?.id) return;
    try {
      this.isSubmitting = true;
      await this.artistService.updateRequestStatus(this.requestArr.id, 3, this.commentText || null);
      this.requestArr.status = 3;
      if (this.commentText) {
        this.requestArr.comment = this.commentText;
        this.requestArr.comments = this.commentText;
      }
      this.requestArr.last_status_change = new Date().toISOString();
    } catch (e) {
      console.error(e);
    } finally {
      this.isSubmitting = false;
    }
  }

  getStatusLabel(status: number | undefined | null): string {
    switch (status) {
      case 1: return 'New';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      default: return String(status ?? '');
    }
  }
  

  statusRequest(id:any){
   let arr = {
    status :parseInt(id),
    last_status_change: new Date(),
    last_status_by: this.loggedUser,
    comment: this.commentText
   } 

   console.log(arr);
   console.log(this.requestArr.id);

   try{
this.artistService.artistRequest(arr, this.requestArr.id).then(()=>{
    if(id == 2){
      this.alertService.showAlert('Approved', 'The requested is approved', 'success');
      this.router.navigate(['hosts/console/requests']);
    }else{
      this.alertService.showAlert('Rejected', 'The requested is rejected', 'warning');
       this.router.navigate(['hosts/console/requests']);
    }
})
   }catch(error:any){
    this.alertService.showAlert('Internal Error', error.message, 'error');
   }
   


  }

rejectRequest(){

}

}
