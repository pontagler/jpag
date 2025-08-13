import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtistsComponent } from './artists/artists.component';
import { VisitorComponent } from './visitor.component';

const routes: Routes = [
    {path: '',component: VisitorComponent,
      children: [
        {path: 'artists', component:ArtistsComponent, data: { urlID: 3 }}
      ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitorRoutingModule { }
