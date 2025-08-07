import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HostsRoutingModule } from './hosts-routing.module';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    SharedModule,
    HostsRoutingModule
  ]
})
export class HostsModule { }
