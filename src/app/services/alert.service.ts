import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  showAlert(title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question') {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonText: 'OK'
    });
  }

dialogAlert(
    title: string,
    confirmText: string,
    denyText: string,
    cancelButton: boolean = true
  ): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: title,
      showDenyButton: true,
      showCancelButton: cancelButton,
      confirmButtonText: confirmText,
      denyButtonText: denyText,
    });
  }


}
