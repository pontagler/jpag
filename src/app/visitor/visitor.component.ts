import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SharedModule],
  templateUrl: './visitor.component.html'
})
export class VisitorComponent {

}
