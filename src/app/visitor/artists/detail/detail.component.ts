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
artist:any = [];
id_artist:any;
bg:any = 'https://pekaexfrnhysdntbyqbl.supabase.co/storage/v1/object/public/artistrequest/istockphoto-821760914-612x612.jpg';
 isLoading: boolean = true;
  ngOnInit(): void {
    this.id_artist = this.route.snapshot.params['id'];
    if (!this.artist || this.artist.length === 0) {
      this.getArtistProfile();
    }

  }

  async getArtistProfile(){
    this.isLoading = true;
    try{
      const data = await this.visitorService.getArtistProfile(this.id_artist);
      this.artist = data && data.length > 0 ? data[0] : {};
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
