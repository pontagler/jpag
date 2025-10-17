import { Component } from '@angular/core';
import { VisitorService } from '../../../services/visitor.service';
import { AlertService } from '../../../services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, TitleCasePipe],
  templateUrl: './detail.component.html'
})
export class DetailComponent {

  constructor(
    private visitorService: VisitorService,
    private alertService: AlertService,
    private route: ActivatedRoute,
   
  ){

  }
artist:any = {};
id_artist:any;
bg:any = 'https://pekaexfrnhysdntbyqbl.supabase.co/storage/v1/object/public/artistrequest/istockphoto-821760914-612x612.jpg';
 isLoading: boolean = true;
  ngOnInit(): void {
    this.id_artist = Number(this.route.snapshot.params['id']);
    this.getArtistProfile();

  }

  async getArtistProfile(){
    this.isLoading = true;
    try{
      const data = await this.visitorService.getArtistProfile(this.id_artist);
      const raw = data && data.length > 0 ? data[0] : {};
      // normalize optional arrays to arrays to simplify template logic
      this.artist = {
        ...raw,
        instruments: Array.isArray(raw?.instruments) ? raw.instruments : [],
        performance_type: Array.isArray(raw?.performance_type) ? raw.performance_type : [],
        education: Array.isArray(raw?.education) ? raw.education : [],
        awards: Array.isArray(raw?.awards) ? raw.awards : [],
        media: Array.isArray(raw?.media) ? raw.media : [],
        upcoming_event: Array.isArray(raw?.upcoming_event) ? raw.upcoming_event : []
      };
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error?.message || 'Unknown error', 'error');
      this.artist = {};
    } finally {
      this.isLoading = false;
    }

  }

openInNewTab(url:any) {
  const newTab = window.open(url, '_blank');
  if (newTab) {
    newTab.focus();
  }
}


}
