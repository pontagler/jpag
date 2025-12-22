import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BackofficeRoutingModule } from './backoffice-routing.module';
import { BackofficeComponent } from './backoffice.component';
import { ArtistComponent, TruncatePipe } from './artist/artist.component';
import { SharedModule } from '../../shared/shared.module';
import { ArtistCreateComponent } from './artist-create/artist-create.component';
import { EventsComponent } from './events/events.component';
import { AccountComponent } from './account/account.component';
import { AccountDetailComponent } from './account/detail/detail.component';
import { StripHtmlPipe } from '../../shared/strip-html.pipe';
import { EditionsComponent } from './editions/editions.component';


@NgModule({
  declarations: [
    BackofficeComponent,
    ArtistComponent,
    ArtistCreateComponent,
    EventsComponent,
    AccountComponent,
    AccountDetailComponent,
    EditionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackofficeRoutingModule,
    SharedModule,
    TruncatePipe,
    StripHtmlPipe,

]
})
export class BackofficeModule { }
