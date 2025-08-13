import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BackofficeRoutingModule } from './backoffice-routing.module';
import { BackofficeComponent } from './backoffice.component';
import { ArtistComponent, TruncatePipe } from './artist/artist.component';
import { SharedModule } from '../../shared/shared.module';
import { ArtistCreateComponent } from './artist-create/artist-create.component';


@NgModule({
  declarations: [
    BackofficeComponent,
    ArtistComponent,
    ArtistCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackofficeRoutingModule,
    SharedModule,
    TruncatePipe,

]
})
export class BackofficeModule { }
