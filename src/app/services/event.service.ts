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

  // Get the host ID (integer) from the hosts table based on authenticated user's profile UUID
  private async getHostId(): Promise<number> {
    const user = await this.authService.getCurrentUser();
    const userId = user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Query hosts table to find the host record with matching id_profile
    const { data, error } = await supabase
      .from('hosts')
      .select('id')
      .eq('id_profile', userId)
      .single();

    if (error || !data) {
      throw new Error('Host profile not found. Please complete your host registration.');
    }

    return data.id;
  }

  //Get Event lists
async getEventsList(){
  const {data, error} = await supabase.rpc('get_events_with_details')
  if(error) throw error
  return data;
}


async getEventsList_v1(){
  const {data, error} = await supabase.rpc('get_events_with_details_v1')
  if(error) throw error
  return data;
}

async getEventsList_v3(){
  const {data, error} = await supabase.rpc('get_events_with_details_v3')
  if(error) throw error
  return data;
}

async getEventsList_vistor(){
  const {data, error} = await supabase.rpc('get_events_with_details_visitor_list')
  if(error) throw error
  return data;
}

// Get events by artist (for event requests) - all statuses
// artistId should be the id_profile (auth user ID) from the artists table
// This matches the created_by column in the events table
async getEventsByArtist(artistId: string): Promise<any[]> {
  try {
    console.log('getEventsByArtist called with id_profile (auth ID):', artistId);
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        teaser,
        description,
        status,
        created_on,
        photo,
        comments,
        created_by,
        id_event_domain,
        sys_event_domain!id_event_domain (
          name
        )
      `)
      .eq('created_by', artistId)
      .order('created_on', { ascending: false });

    console.log('Query result:', { data, error });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    // Flatten the event_domain name
    const formattedData = (data || []).map((event: any) => ({
      ...event,
      event_domain: event.sys_event_domain?.name || 'N/A'
    }));
    
    console.log('Returning data count:', formattedData?.length || 0);
    return formattedData;
  } catch (error: any) {
    console.error('Error fetching artist events:', error);
    throw error;
  }
}



  //Get Event details
  async getEventDetail(id:any){
    const { data, error } = await supabase.rpc('get_single_events_with_details', { p_event_id: id });
    if (error) throw error;
    return data;
  }


    //Get Event details
    async getEventDetail_v1(id:any){
      const { data, error } = await supabase.rpc('get_single_events_with_details_v1', { p_event_id: id });
      if (error) throw error;
      return data;
    }

  async getEventDetailHost(id:any){
    const { data, error } = await supabase.rpc('get_single_events_with_details_host_v1', { p_event_id: id });
    if (error) throw error;
    return data;
  }

  // Base event row for edit
  async getEventBase(id: number){
    const { data, error } = await supabase
      .from('events')
      .select('id, title, teaser, long_teaser, id_edition, id_event_domain, id_event_type, id_host, description, booking_url, status, photo, credit_photo, is_active, comments')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async getEditionById(id_edition: number){
    const { data, error } = await supabase
      .from('event_edition')
      .select('id, name, year, id_edition_type')
      .eq('id', id_edition)
      .single();
    if (error) throw error;
    return data;
  }

  async getEditionTypeById(id_edition_type: number){
    const { data, error } = await supabase
      .from('sys_event_edition')
      .select('id, name')
      .eq('id', id_edition_type)
      .single();
    if (error) throw error;
    return data;
  }

  async getEventDates(id_event: number){
    const { data, error } = await supabase
      .from('event_dates')
      .select('id, start_date, end_date, time, id_location, flag')
      .eq('id_event', id_event)
      .order('start_date')
    if (error) throw error;
    return data;
  }

  // event_shows table doesn't exist in schema - removed

  async getEventArtistInstrumentPairs(id_event: number){
    // Step 1: Get all artists linked to this event
    const { data: eventArtists, error: artistsError } = await supabase
      .from('event_artists')
      .select('id, id_event, id_artist')
      .eq('id_event', id_event);
    
    if (artistsError) {
      console.error('Error fetching event artists:', artistsError);
      throw artistsError;
    }
    
    console.log('✓ Event Artists from event_artists table:', eventArtists);
    
    if (!eventArtists || eventArtists.length === 0) {
      console.log('No artists found for event:', id_event);
      return [];
    }
    
    // Step 2: Get all instrument assignments for this event
    const { data: eventInstruments, error: instrumentsError } = await supabase
      .from('event_instruments')
      .select('id, id_event, id_artist, id_instrument')
      .eq('id_event', id_event);
    
    if (instrumentsError) {
      console.error('Error fetching event instruments:', instrumentsError);
    }
    
    console.log('✓ Event Instruments from event_instruments table:', eventInstruments);
    
    // Step 3: Fetch artist details
    const artistIds = [...new Set(eventArtists.map((item: any) => item.id_artist))];
    console.log('✓ Fetching details for artists:', artistIds);
    
    const { data: artistsData, error: artistDetailsError } = await supabase
      .from('artists')
      .select('id, fname, lname, photo')
      .in('id', artistIds);
    
    if (artistDetailsError) {
      console.error('Error fetching artist details:', artistDetailsError);
    }
    
    console.log('✓ Artists details:', artistsData);
    
    // Step 4: Fetch instrument details if there are any
    const instrumentIds = eventInstruments ? [...new Set(eventInstruments.map((item: any) => item.id_instrument).filter(Boolean))] : [];
    let instrumentsData: any[] = [];
    
    if (instrumentIds.length > 0) {
      console.log('✓ Fetching details for instruments:', instrumentIds);
      const { data: instData, error: instDetailsError } = await supabase
        .from('sys_instruments')
        .select('id, name, color')
        .in('id', instrumentIds);
      
      if (instDetailsError) {
        console.error('Error fetching instrument details:', instDetailsError);
      } else {
        instrumentsData = instData || [];
      }
      console.log('✓ Instruments details:', instrumentsData);
    }
    
    // Step 5: Create lookup maps
    const artistMap = new Map((artistsData || []).map((a: any) => [a.id, a]));
    const instrumentMap = new Map(instrumentsData.map((i: any) => [i.id, i]));
    
    // Step 6: Create map of artist -> instruments
    const artistInstrumentsMap = new Map<number, any[]>();
    (eventInstruments || []).forEach((ei: any) => {
      if (!artistInstrumentsMap.has(ei.id_artist)) {
        artistInstrumentsMap.set(ei.id_artist, []);
      }
      artistInstrumentsMap.get(ei.id_artist)!.push(ei);
    });
    
    console.log('✓ Artist-Instruments mapping:', artistInstrumentsMap);
    
    // Step 7: Transform the data - create one row per artist-instrument combination
    const result: any[] = [];
    
    eventArtists.forEach((ea: any) => {
      const artist = artistMap.get(ea.id_artist);
      const instruments = artistInstrumentsMap.get(ea.id_artist) || [];
      
      if (instruments.length === 0) {
        // Artist with no instrument assigned
        result.push({
          id: ea.id,
          id_event: ea.id_event,
          id_artist: ea.id_artist,
          id_instrument: null,
          artist_fname: artist?.fname || '',
          artist_lname: artist?.lname || '',
          artist_photo: artist?.photo || null,
          instrument_name: 'No instrument assigned'
        });
      } else {
        // Artist with instruments
        instruments.forEach((inst: any) => {
          const instrumentDetails = instrumentMap.get(inst.id_instrument);
          result.push({
            id: inst.id,
            id_event: inst.id_event,
            id_artist: inst.id_artist,
            id_instrument: inst.id_instrument,
            artist_fname: artist?.fname || '',
            artist_lname: artist?.lname || '',
            artist_photo: artist?.photo || null,
            instrument_name: instrumentDetails?.instrument || instrumentDetails?.name || 'Unknown'
          });
        });
      }
    });
    
    console.log('✓✓ Final result with all artists:', result);
    console.log('✓✓ Total rows (artist-instrument pairs):', result.length);
    
    return result;
  }

  // Lookups for create flow
  async listSysEventDomains(){
    const { data, error } = await supabase.from('sys_event_domain').select('id, name').order('name');
    if (error) throw error;
    return data;
  }

  async listSysEventEditions(){
    const { data, error } = await supabase.from('sys_event_edition').select('id, name').order('name');
    if (error) throw error;
    return data;
  }

  async listEditionsByType(editionTypeId: number | null = null){
    let query = supabase.from('event_edition').select('id, name, year, id_edition_type').order('year', { ascending: false });
    if (editionTypeId) {
      query = query.eq('id_edition_type', editionTypeId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async listSysEventTypes(){
    const { data, error } = await supabase.from('sys_event_type').select('id, name').order('name');
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
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${ext}`;
      // Upload directly to bucket root (no subfolder)
      const objectPath = fileName;
      
      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('events')
        .upload(objectPath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('events')
        .getPublicUrl(objectPath);
      
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(error.message || 'Failed to upload event image');
    }
  }

  // Create base event row
  async createEventRow(payload: {
    title: string;
    teaser: string | null;
    long_teaser?: string | null;
    id_edition: number | null;
    id_event_domain: number | null;
    id_event_type: number | null;
    description: string | null;
    booking_url: string | null;
    photo: string | null;
    credit_photo?: string | null;
    status: number;
    is_active?: boolean;
  }): Promise<number> {
    const created_by = await this.getAuthUserId();
    
    // Try to get host ID, fallback to null if not found
    let id_host = null;
    try {
      id_host = await this.getHostId();
    } catch (err) {
      console.warn('Could not find host ID, setting to null:', err);
    }
    
    const { data, error } = await supabase
      .from('events')
      .insert({ ...payload, id_host, created_by })
      .select('id')
      .single();
    
    if (error) {
      console.error('Event creation error:', error);
      throw new Error(error.message || 'Failed to create event');
    }
    
    return (data as any).id as number;
  }

  // Update base event row (partial)
  async updateEventRow(id: number, payload: Partial<{
    title: string;
    teaser: string | null;
    long_teaser: string | null;
    id_edition: number | null;
    id_event_domain: number | null;
    id_event_type: number | null;
    description: string | null;
    booking_url: string | null;
    photo: string | null;
    credit_photo: string | null;
    status: number;
    is_active: boolean;
    comments: string | null;
  }>): Promise<void> {
    const updated_by = await this.getAuthUserId();
    const { data, error } = await supabase
      .from('events')
      .update({ ...payload, updated_by, last_update: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update event error:', error);
      throw new Error(error.message || 'Failed to update event');
    }
    
    console.log('Event updated successfully:', data);
  }

  async insertEventDates(id_event: number, dates: Array<{ start_date: string; end_date?: string | null; time: string | null; id_location?: number | null; flag?: string | null }>) {
    if (!dates || dates.length === 0) return;
    const created_by = await this.getAuthUserId();
    const rows = dates.map(d => ({ 
      id_event, 
      start_date: d.start_date, 
      end_date: d.end_date || null, 
      time: d.time, 
      id_location: d.id_location || null,
      flag: d.flag || null,
      created_by 
    }));
    const { error } = await supabase.from('event_dates').insert(rows);
    if (error) throw error;
  }

  async replaceEventDates(id_event: number, dates: Array<{ start_date: string; end_date?: string | null; time: string | null; id_location?: number | null; flag?: string | null }>) {
    // remove existing
    const { error: delErr } = await supabase
      .from('event_dates')
      .delete()
      .eq('id_event', id_event);
    if (delErr) throw delErr;

    if (!dates || dates.length === 0) return;
    const created_by = await this.getAuthUserId();
    const rows = dates.map(d => ({ 
      id_event, 
      start_date: d.start_date, 
      end_date: d.end_date || null, 
      time: d.time,
      id_location: d.id_location || null,
      flag: d.flag || null,
      created_by 
    }));
    const { error: insErr } = await supabase.from('event_dates').insert(rows);
    if (insErr) throw insErr;
  }

  // event_shows methods removed - table doesn't exist in schema

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

  async insertEventMedia(id_event: number, media: Array<{ id_media_type: number; title: string; image: string | null; description: string | null; url: string | null }>) {
    if (!media || media.length === 0) return;
    const created_by = await this.getAuthUserId();
    const { error } = await supabase.from('event_media').insert(
      media.map(m => ({ id_event, id_media_type: m.id_media_type, title: m.title, image: m.image, description: m.description, url: m.url, created_by }))
    );
    if (error) throw error;
  }

  async replaceEventMedia(id_event: number, media: Array<{ id_media_type: number; title: string; image: string | null; description: string | null; url: string | null }>) {
    const { error: delErr } = await supabase
      .from('event_media')
      .delete()
      .eq('id_event', id_event);
    if (delErr) throw delErr;

    if (!media || media.length === 0) return;
    const created_by = await this.getAuthUserId();
    const { error: insErr } = await supabase.from('event_media').insert(
      media.map(m => ({ id_event, id_media_type: m.id_media_type, title: m.title, image: m.image, description: m.description, url: m.url, created_by }))
    );
    if (insErr) throw insErr;
  }

  async getEventMedia(id_event: number) {
    const { data, error } = await supabase
      .from('event_media')
      .select('id, id_media_type, title, image, description, url')
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

  /**
   * Deletes an event and all its related data
   * @param id_event - The event ID to delete
   */
  async deleteEvent(id_event: number): Promise<void> {
    try {
      // 1) Delete event instruments
      const { error: delInstErr } = await supabase
        .from('event_instruments')
        .delete()
        .eq('id_event', id_event);
      if (delInstErr) throw delInstErr;

      // 2) Delete event artists
      const { error: delArtErr } = await supabase
        .from('event_artists')
        .delete()
        .eq('id_event', id_event);
      if (delArtErr) throw delArtErr;

      // 3) Delete event media
      const { error: delMediaErr } = await supabase
        .from('event_media')
        .delete()
        .eq('id_event', id_event);
      if (delMediaErr) throw delMediaErr;

      // 4) Delete event dates
      const { error: delDatesErr } = await supabase
        .from('event_dates')
        .delete()
        .eq('id_event', id_event);
      if (delDatesErr) throw delDatesErr;

      // 5) Finally delete the event itself
      const { error: delEventErr } = await supabase
        .from('events')
        .delete()
        .eq('id', id_event);
      if (delEventErr) throw delEventErr;

    } catch (error: any) {
      console.error('Delete event error:', error);
      throw new Error(error.message || 'Failed to delete event');
    }
  }

}