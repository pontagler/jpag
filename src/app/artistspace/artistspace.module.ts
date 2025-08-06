import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ArtistspaceRoutingModule } from './artistspace-routing.module';
import {LoginComponent } from './login/login.component'; // Assuming you have a LoginComponent
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [LoginComponent], // Assuming LoginComponent is declared here
  imports: [
    CommonModule,
    SharedModule, // Importing SharedModule for Header and Footer
    ArtistspaceRoutingModule,
    FormsModule,
    RouterModule
  ]
})
export class ArtistspaceModule { }
