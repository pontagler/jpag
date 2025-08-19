import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtistsComponent } from './artists/artists.component';
import { VisitorComponent } from './visitor.component';
import { DetailComponent as ArtistDetailComponent } from './artists/detail/detail.component';
import { LocationDetailComponent } from './locations/detail/detail.component';
import { LocationsComponent } from './locations/locations.component';
import { EventsComponent } from './events/events.component';
import { DetailComponent } from './events/detail/detail.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
    {path: '',component: VisitorComponent,
      children: [
        {path: '', component:HomeComponent, data: { urlID: 317 }},
        {path: 'artists', component:ArtistsComponent, data: { urlID: 311 }},
        {path: 'artists/:id', component:ArtistDetailComponent, data: { urlID: 312}},
        {path: 'locations', component:LocationsComponent, data: { urlID: 313}},
        {path: 'locations/:id', component:LocationDetailComponent, data: { urlID: 314}},
        {path: 'events', component:EventsComponent, data: { urlID: 315}},
        {path: 'events/:id', component:DetailComponent, data: { urlID: 316}},
      ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitorRoutingModule { }
