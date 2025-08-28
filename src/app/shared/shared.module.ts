import { NgModule } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
RouterModule
  
    
  ],
  exports: [HeaderComponent, FooterComponent],
})
export class SharedModule { }
