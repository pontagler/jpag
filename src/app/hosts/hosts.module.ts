import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HostsRoutingModule } from './hosts-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    HostsRoutingModule
  ]
})
export class HostsModule { }
