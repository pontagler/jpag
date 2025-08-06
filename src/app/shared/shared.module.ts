import { NgModule } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from './footer/footer.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

  
    
  ],
  exports: [HeaderComponent, FooterComponent],
})
export class SharedModule { }
