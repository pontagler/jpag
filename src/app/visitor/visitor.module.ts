import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VisitorRoutingModule } from './visitor-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { VisitorComponent } from './visitor.component';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule,
    VisitorRoutingModule,
    SharedModule,
    FormsModule,
    
  ]
})
export class VisitorModule { }
