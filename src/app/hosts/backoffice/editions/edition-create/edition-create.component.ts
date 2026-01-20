import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../services/event.service';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-edition-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edition-create.component.html'
})
export class EditionCreateComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editionForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      year: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      id_edition_type: [null]
    });
  }

  editionForm: FormGroup;
  isSaving: boolean = false;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  editionId: number | null = null;
  editionTypes: Array<{ id: number; name: string }> = [];

  async ngOnInit(): Promise<void> {
    try {
      // Load edition types
      const types = await this.eventService.listSysEventEditions();
      this.editionTypes = types || [];

      // Check if editing
      const idParam = this.route.snapshot.paramMap.get('id');
      const editingId = idParam ? Number(idParam) : null;
      this.isEditMode = !!editingId && !Number.isNaN(editingId);
      
      if (this.isEditMode && editingId) {
        this.editionId = editingId;
        this.isLoading = true;
        await this.loadEdition(editingId);
        this.isLoading = false;
      }
    } catch (err: any) {
      this.isLoading = false;
      this.alertService.showAlert('Error', err.message || 'Failed to load data', 'error');
    }
  }

  async loadEdition(id: number): Promise<void> {
    try {
      const edition = await this.eventService.getEditionWithType(id);
      if (edition) {
        this.editionForm.patchValue({
          name: edition.name || '',
          year: edition.year || '',
          id_edition_type: edition.id_edition_type || null
        });
      }
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to load edition', 'error');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.editionForm.invalid) {
      this.editionForm.markAllAsTouched();
      this.alertService.showAlert('Validation', 'Please complete all required fields', 'warning');
      return;
    }

    this.isSaving = true;
    try {
      const formValue = this.editionForm.value;
      
      if (this.isEditMode && this.editionId) {
        await this.eventService.updateEdition(this.editionId, {
          name: formValue.name,
          year: formValue.year,
          id_edition_type: formValue.id_edition_type || null
        });
        this.alertService.showAlert('Success', 'Edition updated successfully', 'success');
      } else {
        const newId = await this.eventService.createEdition({
          name: formValue.name,
          year: formValue.year,
          id_edition_type: formValue.id_edition_type || null
        });
        this.alertService.showAlert('Success', 'Edition created successfully', 'success');
        this.editionId = newId;
        this.isEditMode = true;
      }
      
      // Navigate back to list after a short delay
      setTimeout(() => {
        this.router.navigate(['/hosts/console/editions']);
      }, 1000);
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to save edition', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/hosts/console/editions']);
  }

  async deleteEdition(): Promise<void> {
    if (!this.editionId || !this.isEditMode) {
      return;
    }

    const confirmed = await this.alertService.confirmDelete(
      'Delete Edition?',
      'Are you sure you want to delete this edition? This action cannot be undone.',
      'Yes, delete it!'
    );
    
    if (!confirmed) return;

    this.isSaving = true;
    try {
      await this.eventService.deleteEdition(this.editionId);
      this.alertService.showAlert('Success', 'Edition deleted successfully', 'success');
      this.router.navigate(['/hosts/console/editions']);
    } catch (err: any) {
      this.alertService.showAlert('Error', err.message || 'Failed to delete edition', 'error');
    } finally {
      this.isSaving = false;
    }
  }
}





