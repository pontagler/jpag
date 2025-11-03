import { NgModule } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { ArtistHeaderComponent } from './artist-header/artist-header.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ArtistHeaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
RouterModule
  
    
  ],
  exports: [HeaderComponent, FooterComponent, ArtistHeaderComponent],
})
export class SharedModule { }
