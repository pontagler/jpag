import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-request',
  imports: [NgIf, NgClass, NgFor],
  templateUrl: './request.component.html',
  
})
export class RequestComponent {
activeTab: number | undefined;

constructor() { }

ngOnInit(): void {
  this.activeTab = 1; 
}
events = [
    {
      title: 'Concert Cloud Nine',
      status: 'Pending',
      eventDate: '25 Aug 2025',
      submittedDate: '25 Aug 2025',
    },
    {
      title: 'Jazz Night Live',
      status: 'Approved',
      eventDate: '28 Aug 2025',
      submittedDate: '26 Aug 2025',
    },
    // Add more events as needed
  ];



}
