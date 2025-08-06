import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtistComponent } from './artist/artist.component';
import { AuthGuard } from '../../guard/auth.guard';
import { ProfileComponent } from './profile.component';
import { RequestComponent } from './request/request.component';
import { EventsComponent } from './events/events.component';
import { InstrumentsComponent } from './instruments/instruments.component';
import { MediaComponent } from './media/media.component';

const routes: Routes = [
  {path: '', component: ProfileComponent,
    
    children: [
    {path: '', redirectTo: 'artist', pathMatch: 'full'},
    {path: 'artist', component: ArtistComponent, },
    {path: 'instruments', component: InstrumentsComponent, },
    {path: 'media', component: MediaComponent, },
    {path: 'requests', component: RequestComponent, },
    {path: 'events', component: EventsComponent, },
  ]
    

  //  canActivate: [AuthGuard] 
  },
  
    
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
