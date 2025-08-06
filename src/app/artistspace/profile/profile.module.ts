import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ArtistComponent } from './artist/artist.component';
import { ProfileComponent } from './profile.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ArtistComponent,
    ProfileComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    FormsModule
    
    
  ]
})
export class ProfileModule { }
