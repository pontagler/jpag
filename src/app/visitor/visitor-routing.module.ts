import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtistsComponent } from './artists/artists.component';
import { VisitorComponent } from './visitor.component';
import { DetailComponent } from './artists/detail/detail.component';

const routes: Routes = [
    {path: '',component: VisitorComponent,
      children: [
        {path: 'artists', component:ArtistsComponent, data: { urlID: 311 }},
        {path: 'artists/:id', component:DetailComponent, data: { urlID: 312}}
      ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitorRoutingModule { }
