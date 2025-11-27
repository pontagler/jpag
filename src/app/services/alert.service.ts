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

  /**
   * Shows a confirmation dialog for dangerous actions like delete
   * @param title - Dialog title
   * @param text - Dialog message
   * @param confirmButtonText - Text for confirm button (default: 'Yes, delete it!')
   * @returns Promise<boolean> - true if confirmed, false if cancelled
   */
  async confirmDelete(
    title: string,
    text: string,
    confirmButtonText: string = 'Yes, delete it!'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });
    return result.isConfirmed;
  }


}
