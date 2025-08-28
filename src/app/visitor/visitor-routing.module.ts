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
import { AboutComponent } from './about/about.component';

const routes: Routes = [
    {path: '',component: VisitorComponent,
      children: [
        {path: '', component:HomeComponent},
        {path: 'artists', component:ArtistsComponent },
        {path: 'artists/:id', component:ArtistDetailComponent},
        {path: 'locations', component:LocationsComponent},
        {path: 'locations/:id', component:LocationDetailComponent},
        {path: 'events', component:EventsComponent},
        {path: 'events/:id', component:DetailComponent},
        {path: 'about', component:AboutComponent},
      ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitorRoutingModule { }
