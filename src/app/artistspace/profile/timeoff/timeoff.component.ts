import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ArtistService } from '../../../services/artist.service';

@Component({
  selector: 'app-timeoff',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './timeoff.component.html'
})
export class TimeoffComponent implements  OnInit {

  constructor(
    private artistService: ArtistService
  ){

  }

  artistData:any = [];
  id_artist:any;
  userID:any;
  
  ngOnInit(): void {
    this.artistData = this.artistService.getArtistProfilebyID();
    this.id_artist = this.artistData.id;
    this.userID = this.artistService.getLoggedUserID();
    this.loadTimeOff();
  }
  showEdit: boolean = true;

  startDate: string = '';
  endDate: string = '';
  note: string = '';

  editingIndex: number | null = null;

  entries: Array<{
    id?: number;
    startDate: string;
    endDate: string;
    days: number;
    note?: string;
  }> = [];

  async loadTimeOff(): Promise<void> {
    try {
      const data = await this.artistService.getArtistTimeOff(this.id_artist);
      this.entries = (data || []).map((row: any) => ({
        id: row.id,
        startDate: row.start_date,
        endDate: row.end_date,
        days: this.calculateInclusiveDays(row.start_date, row.end_date),
        note: row.notes || ''
      }));
    } catch (e) {
      console.error('Failed to load timeoff', e);
    }
  }

  get computedDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffMs = end.setHours(0,0,0,0) - start.setHours(0,0,0,0);
    if (diffMs < 0) return 0;
    // inclusive day count
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  resetForm(): void {
    this.startDate = '';
    this.endDate = '';
    this.note = '';
    this.editingIndex = null;
  }

  addOrUpdate(): void {
    if (!this.startDate || !this.endDate) return;
    const days = this.computedDays;
    if (days <= 0) return;

    if (this.editingIndex !== null) {
      this.updateEntry(this.editingIndex);
    } else {
      this.addEntry();
    }
  }

  private calculateInclusiveDays(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diffMs = e.setHours(0,0,0,0) - s.setHours(0,0,0,0);
    if (diffMs < 0) return 0;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  private async addEntry(): Promise<void> {
    const payload: any = {
      id_artist: Number(this.id_artist),
      start_date: this.startDate,
      end_date: this.endDate,
      notes: this.note?.trim() || null,
      created_by: this.userID
    };
    try {
      await this.artistService.addArtistTimeOff(payload);
      await this.loadTimeOff();
      this.resetForm();
      this.showEdit = false;
    } catch (e) {
      console.error('Failed to add timeoff', e);
    }
  }

  private async updateEntry(index: number): Promise<void> {
    const target = this.entries[index];
    if (!target || target.id == null) return;
    const payload: any = {
      id_artist: Number(this.id_artist),
      start_date: this.startDate,
      end_date: this.endDate,
      notes: this.note?.trim() || null,
      updated_by: this.userID,
      last_updated: new Date().toISOString()
    };
    try {
      await this.artistService.editArtistTimeOff(payload, target.id);
      await this.loadTimeOff();
      this.resetForm();
      this.showEdit = false;
    } catch (e) {
      console.error('Failed to update timeoff', e);
    }
  }

  edit(index: number): void {
    const item = this.entries[index];
    if (!item) return;
    this.startDate = item.startDate;
    this.endDate = item.endDate;
    this.note = item.note || '';
    this.editingIndex = index;
    this.showEdit = true;
  }

  async delete(index: number): Promise<void> {
    const item = this.entries[index];
    if (!item || item.id == null) {
      this.entries.splice(index, 1);
      return;
    }
    try {
      await this.artistService.deleteArtistTimeOff(item.id);
      await this.loadTimeOff();
      if (this.editingIndex === index) {
        this.resetForm();
      }
    } catch (e) {
      console.error('Failed to delete timeoff', e);
    }
  }
}
