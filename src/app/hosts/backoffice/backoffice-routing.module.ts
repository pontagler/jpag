import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackofficeComponent } from './backoffice.component';
import { ArtistComponent } from './artist/artist.component';
import { ArtistCreateComponent } from './artist-create/artist-create.component';
import { HomeComponent } from './home/home.component';
import { EventsComponent } from './events/events.component';
import { EventDetailComponent } from './events/event-detail/event-detail.component';
import { LocationsComponent } from './locations/locations.component';
import { LocationDetailComponent } from './locations/location-detail/location-detail.component';
import { HostsComponent } from './hosts/hosts.component';
import { LocationCreateComponent } from './locations/location-create/location-create.component';
import { AccountComponent } from './account/account.component';
import { ArtistDetailComponent } from './artist/artist-detail/artist-detail.component';
import { RequestsComponent } from './requests/requests.component';
import { RequestDetailComponent } from './requests/request-detail/request-detail.component';
import { CreateEventComponent } from './events/create-event/create-event.component';

const routes: Routes = [
  {path:'', component: BackofficeComponent, children:[
    
    {path:'home', component: HomeComponent, data:{urlID:41}},
    {path:'events', component: EventsComponent, data:{urlID:42}},
    {path:'events/create', component: CreateEventComponent, data:{urlID:420}},
    {path:'events/:id/edit', component: CreateEventComponent, data:{urlID:4201}},
    {path:'events/:id', component: EventDetailComponent, data:{urlID:421}},
    {path:'artists', component: ArtistComponent, data:{urlID:43}},
    {path:'artists/create', component: ArtistCreateComponent, data:{urlID:431}},
    {path:'artists/:id', component: ArtistDetailComponent, data:{urlID:432}},
    {path:'locations', component: LocationsComponent, data:{urlID:44}},
    {path:'locations/create', component: LocationCreateComponent, data:{urlID:441}},
    {path:'locations/:id', component: LocationDetailComponent, data:{urlID:442}},
    {path:'hosts', component: HostsComponent, data:{urlID:45}},
    {path:'account', component: AccountComponent, data:{urlID:46}},
    {path:'requests', component: RequestsComponent, data:{urlID:47}},
    {path:'requests/:id', component: RequestDetailComponent, data:{urlID:48}},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackofficeRoutingModule { }
