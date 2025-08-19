import { Injectable, signal, effect } from '@angular/core';
import { supabase, supabase1 } from '../core/supabase';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { ArtistService } from './artist.service';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})


export class EventService {

  constructor(
    private authService: AuthService,
    private artistService: ArtistService,
    private locationService: LocationService
  ) { }

  private async getAuthUserId(): Promise<string> {
    const user = await this.authService.getCurrentUser();
    return (user?.id as string) || '';
  }

  //Get Event lists
async getEventsList(){
  const {data, error} = await supabase.rpc('get_event_list')
  if(error) throw error
  return data;
}


  //Get Event details
  async getEventDetail(id:any){
    const {data, error} = await supabase.rpc('get_event_info', {p_id_event: id})
    if(error) throw error
    return data;
  }

  // Base event row for edit
  async getEventBase(id: number){
    const { data, error } = await supabase
      .from('events')
      .select('id, title, teaser, id_edition, id_location, id_type, description, booking_url, status, photo')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async getEditionById(id_edition: number){
    const { data, error } = await supabase
      .from('sys_edition')
      .select('id, id_programme')
      .eq('id', id_edition)
      .single();
    if (error) throw error;
    return data;
  }

  async getProgrammeById(id_programme: number){
    const { data, error } = await supabase
      .from('sys_programme')
      .select('id, id_event')
      .eq('id', id_programme)
      .single();
    if (error) throw error;
    return data;
  }

  async getEventDates(id_event: number){
    const { data, error } = await supabase
      .from('event_dates')
      .select('date, time')
      .eq('id_event', id_event)
      .order('date')
    if (error) throw error;
    return data;
  }

  async getEventShows(id_event: number){
    const { data, error } = await supabase
      .from('event_shows')
      .select('title, description, time_manage')
      .eq('id_event', id_event)
      .order('id')
    if (error) throw error;
    return data;
  }

  async getEventArtistInstrumentPairs(id_event: number){
    const { data, error } = await supabase
      .from('event_instruments')
      .select('id_artist, id_instrument')
      .eq('id_event', id_event);
    if (error) throw error;
    return data as Array<{ id_artist: string; id_instrument: number }>;
  }

  // Lookups for create flow
  async listSysEvents(){
    const { data, error } = await supabase.from('sys_events').select('id, name').order('name');
    if (error) throw error;
    return data;
  }

  async listProgrammesByEvent(eventId: number){
    const { data, error } = await supabase.from('sys_programme').select('id, name, id_event').eq('id_event', eventId).order('name');
    if (error) throw error;
    return data;
  }

  async listEditionsByProgramme(programmeId: number){
    const { data, error } = await supabase.from('sys_edition').select('id, name, year, id_programme').eq('id_programme', programmeId).order('year', { ascending: false });
    if (error) throw error;
    return data;
  }

  async listSysEventTypes(){
    const { data, error } = await supabase.from('sys_event_types').select('id, name').order('name');
    if (error) throw error;
    return data;
  }

  async listAllLocations(){
    return await this.locationService.getallLocation();
  }

  async listAllArtists(){
    return await this.artistService.getAllArtists();
  }

  async listAllInstruments(){
    return await firstValueFrom(this.artistService.getInstruments());
  }

  // Upload main event image to 'events' storage bucket
  async uploadEventImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${ext}`;
    const userId = await this.getAuthUserId();
    const objectPath = `${userId}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('events')
      .upload(objectPath, file);
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = await supabase.storage
      .from('events')
      .getPublicUrl(objectPath);
    return publicUrlData.publicUrl;
  }

  // Create base event row
  async createEventRow(payload: {
    title: string;
    teaser: string | null;
    id_edition: number | null;
    id_location: number | null;
    id_type: number | null;
    id_host: string;
    description: string | null;
    booking_url: string | null;
    photo: string | null;
    status: number;
  }): Promise<number> {
    const created_by = await this.getAuthUserId();
    const { data, error } = await supabase
      .from('events')
      .insert({ ...payload, created_by })
      .select('id')
      .single();
    if (error) throw error;
    return (data as any).id as number;
  }

  // Update base event row (partial)
  async updateEventRow(id: number, payload: Partial<{
    title: string;
    teaser: string | null;
    id_edition: number | null;
    id_location: number | null;
    id_type: number | null;
    description: string | null;
    booking_url: string | null;
    photo: string | null;
    status: number;
  }>): Promise<void> {
    const updated_by = await this.getAuthUserId();
    const { error } = await supabase
      .from('events')
      .update({ ...payload, updated_by })
      .eq('id', id);
    if (error) throw error;
  }

  async insertEventDates(id_event: number, dates: Array<{ date: string; time: string }>) {
    if (!dates || dates.length === 0) return;
    const created_by = await this.getAuthUserId();
    const rows = dates.map(d => ({ id_event, date: d.date, time: d.time, created_by }));
    const { error } = await supabase.from('event_dates').insert(rows);
    if (error) throw error;
  }

  async replaceEventDates(id_event: number, dates: Array<{ date: string; time: string }>) {
    // remove existing
    const { error: delErr } = await supabase
      .from('event_dates')
      .delete()
      .eq('id_event', id_event);
    if (delErr) throw delErr;

    if (!dates || dates.length === 0) return;
    const created_by = await this.getAuthUserId();
    const rows = dates.map(d => ({ id_event, date: d.date, time: d.time, created_by }));
    const { error: insErr } = await supabase.from('event_dates').insert(rows);
    if (insErr) throw insErr;
  }

  async insertEventShows(id_event: number, shows: Array<{ title: string; description: string; time_manage: string | null }>) {
    if (!shows || shows.length === 0) return;
    const created_by = await this.getAuthUserId();
    const { error } = await supabase.from('event_shows').insert(
      shows.map(s => ({ id_event, title: s.title, description: s.description, time_manage: s.time_manage, created_by }))
    );
    if (error) throw error;
  }

  async replaceEventShows(id_event: number, shows: Array<{ title: string; description: string; time_manage: string | null }>) {
    const { error: delErr } = await supabase
      .from('event_shows')
      .delete()
      .eq('id_event', id_event);
    if (delErr) throw delErr;

    if (!shows || shows.length === 0) return;
    const created_by = await this.getAuthUserId();
    const { error: insErr } = await supabase.from('event_shows').insert(
      shows.map(s => ({ id_event, title: s.title, description: s.description, time_manage: s.time_manage, created_by }))
    );
    if (insErr) throw insErr;
  }

  async insertEventArtists(id_event: number, artistIds: string[]) {
    if (!artistIds || artistIds.length === 0) return;
    const created_by = await this.getAuthUserId();
    const { error } = await supabase.from('event_artists').insert(
      artistIds.map(id_artist => ({ id_event, id_artist, created_by }))
    );
    if (error) throw error;
  }

  async insertEventInstruments(id_event: number, mappings: Array<{ id_instrument: number; id_artist?: string | null }>) {
    if (!mappings || mappings.length === 0) return;
    const created_by = await this.getAuthUserId();
    const { error } = await supabase.from('event_instruments').insert(
      mappings.map(m => ({ id_event, id_instrument: m.id_instrument, id_artist: m.id_artist ?? null, created_by }))
    );
    if (error) throw error;
  }

  async replaceEventArtists(id_event: number, artistIds: string[]) {
    const { error: delErr } = await supabase
      .from('event_artists')
      .delete()
      .eq('id_event', id_event);
    if (delErr) throw delErr;
    await this.insertEventArtists(id_event, artistIds);
  }

  async replaceEventInstruments(id_event: number, mappings: Array<{ id_instrument: number; id_artist?: string | null }>) {
    const { error: delErr } = await supabase
      .from('event_instruments')
      .delete()
      .eq('id_event', id_event);
    if (delErr) throw delErr;
    await this.insertEventInstruments(id_event, mappings);
  }

  async ensureEventArtist(id_event: number, id_artist: string): Promise<void> {
    const { data, error } = await supabase
      .from('event_artists')
      .select('id')
      .eq('id_event', id_event)
      .eq('id_artist', id_artist)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error; // ignore not found
    if (!data) {
      const created_by = await this.getAuthUserId();
      const { error: insErr } = await supabase
        .from('event_artists')
        .insert({ id_event, id_artist, created_by });
      if (insErr) throw insErr;
    }
  }

  async addEventInstrument(id_event: number, id_artist: string, id_instrument: number): Promise<void> {
    // ensure artist row exists first
    await this.ensureEventArtist(id_event, id_artist);
    // check mapping exists
    const { data, error } = await supabase
      .from('event_instruments')
      .select('id')
      .eq('id_event', id_event)
      .eq('id_artist', id_artist)
      .eq('id_instrument', id_instrument)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) {
      const created_by = await this.getAuthUserId();
      const { error: insErr } = await supabase
        .from('event_instruments')
        .insert({ id_event, id_artist, id_instrument, created_by });
      if (insErr) throw insErr;
    }
  }

  async removeEventInstrument(id_event: number, id_artist: string, id_instrument: number): Promise<void> {
    const { error } = await supabase
      .from('event_instruments')
      .delete()
      .eq('id_event', id_event)
      .eq('id_artist', id_artist)
      .eq('id_instrument', id_instrument);
    if (error) throw error;
  }

  async eventInstrumentExists(id_event: number, id_artist: string, id_instrument: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('event_instruments')
      .select('id')
      .eq('id_event', id_event)
      .eq('id_artist', id_artist)
      .eq('id_instrument', id_instrument)
      .maybeSingle();
    if (error && (error as any).code !== 'PGRST116') throw error;
    return !!data;
  }

  async removeEventArtist(id_event: number, id_artist: string): Promise<void> {
    // delete mappings first
    const { error: delMapErr } = await supabase
      .from('event_instruments')
      .delete()
      .eq('id_event', id_event)
      .eq('id_artist', id_artist);
    if (delMapErr) throw delMapErr;
    const { error } = await supabase
      .from('event_artists')
      .delete()
      .eq('id_event', id_event)
      .eq('id_artist', id_artist);
    if (error) throw error;
  }

  async insertEventMedia(id_event: number, media: Array<{ id_media: number; title: string; image: string | null; description: string | null; url: string | null }>) {
    if (!media || media.length === 0) return;
    const created_by = await this.getAuthUserId();
    const { error } = await supabase.from('event_media').insert(
      media.map(m => ({ id_event, id_media: m.id_media, title: m.title, image: m.image, description: m.description, url: m.url, created_by }))
    );
    if (error) throw error;
  }

  async replaceEventMedia(id_event: number, media: Array<{ id_media: number; title: string; image: string | null; description: string | null; url: string | null }>) {
    const { error: delErr } = await supabase
      .from('event_media')
      .delete()
      .eq('id_event', id_event);
    if (delErr) throw delErr;

    if (!media || media.length === 0) return;
    const created_by = await this.getAuthUserId();
    const { error: insErr } = await supabase.from('event_media').insert(
      media.map(m => ({ id_event, id_media: m.id_media, title: m.title, image: m.image, description: m.description, url: m.url, created_by }))
    );
    if (insErr) throw insErr;
  }

  async getEventMedia(id_event: number) {
    const { data, error } = await supabase
      .from('event_media')
      .select('id, id_media, title, image, description, url')
      .eq('id_event', id_event)
      .order('id');
    if (error) throw error;
    return data;
  }



  async getAvailableArtists(){
    const {data, error} = await supabase.from('vw_available_artists').select()
    if(error) throw error
    return data;
  }

    async getArtistInstruments(id_artist:any){
    const {data, error} = await supabase.from('vw_get_artist_instruments').select().eq('id_artist', id_artist)
    if(error) throw error
    return data;
  }


async allAnI(arr: any) {
  const arr1 = {
    id_event: arr.id_event,
    id_artist: arr.id_artist,
    created_by: arr.created_by,
  };

  const arr2 = {
    id_event: arr.id_event,
    id_instrument: arr.id_inst,
    id_artist: arr.id_artist,
    created_by: arr.created_by,
  };

  try {
    // Insert into event_artists
    const { error: err1 } = await supabase
      .from("event_artists")
      .insert(arr1);

    if (err1) throw err1;

    // Insert into event_instruments
    const { data, error: err2 } = await supabase
      .from("event_instruments")
      .insert(arr2);

    if (err2) throw err2;

    return data; // return inserted instrument rows
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
}



async RemoveallAnI(arr: any) {
 
  try {
    // Insert into event_artists
    const { error: err1 } = await supabase
      .from("event_artists")
      .delete()
      .eq('id_event', arr.id_event)
      .eq('id_artist', arr.id_artist)

    if (err1) throw err1;

    // Insert into event_instruments
    const { data, error: err2 } = await supabase
      .from("event_instruments")
      .delete()
      .eq('id_event', arr.id_event)
      .eq('id_artist', arr.id_artist)
      .eq('id_instrument', arr.id_instrument)


    if (err2) throw err2;

    return data; // return inserted instrument rows
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
}



}