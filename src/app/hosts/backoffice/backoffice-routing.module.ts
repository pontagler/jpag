import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackofficeComponent } from './backoffice.component';
import { ArtistComponent } from './artist/artist.component';
import { ArtistCreateComponent } from './artist-create/artist-create.component';
import { HomeComponent } from './home/home.component';
import { EventsComponent } from './events/events.component';
import { LocationsComponent } from './locations/locations.component';
import { HostsComponent } from './hosts/hosts.component';
import { AccountComponent } from './account/account.component';
import { ArtistDetailComponent } from './artist/artist-detail/artist-detail.component';

const routes: Routes = [
  {path:'', component: BackofficeComponent, children:[
    
    {path:'home', component: HomeComponent, data:{urlID:41}},
    {path:'events', component: EventsComponent, data:{urlID:42}},
    {path:'artists', component: ArtistComponent, data:{urlID:43}},
    {path:'artists/create', component: ArtistCreateComponent, data:{urlID:431}},
    {path:'artists/:id', component: ArtistDetailComponent, data:{urlID:432}},
    {path:'locations', component: LocationsComponent, data:{urlID:44}},
    {path:'hosts', component: HostsComponent, data:{urlID:45}},
    {path:'account', component: AccountComponent, data:{urlID:46}},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackofficeRoutingModule { }
