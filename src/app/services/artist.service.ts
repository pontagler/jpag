import { Injectable, signal, effect } from '@angular/core';
import { supabase } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';



export interface ArtistRequest {
  id_artist: string;
  id_req_type: number;
  title: string;
  instrument: string[];
  short_desc: string;
  long_desc: string;
  propose_date: string[]; // or Date[] if using TIMESTAMPTZ
  id_host: string;
  status?: number;
}


@Injectable({
  providedIn: 'root'
})


export class ArtistService {

  constructor() { }
  //Fetch artist profile by ID
  async getArtistProfile(artistId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_artist_profile', { artist_id: artistId });

    if (error) throw error;
    return data;
  }

  private artistProfileID = signal<string | null>(null);
  private artistProfile = signal<any>(null);
  private artistID = signal<string | null>(null);

  setArtistProfileID(id: string) {
    this.artistProfileID.set(id);
  }

  setArtistID(id: string) {
    this.artistID.set(id);
  }

  getArtistID() {
    return this.artistID();
  }

  getArtistProfileID() {
    return this.artistProfileID();
  }

  setArtistProfile(profile: any) {
    this.artistProfile.set(profile);
  }

  getArtistProfilebyID() {
    return this.artistProfile();
  }

  getInstruments(): Observable<any[]> {
    return new Observable(observer => {
      supabase
        .from('sys_instruments')
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            observer.error(error);
          } else {
            observer.next(data);
            observer.complete();
          }
        });
    });
  }

  async createArtistRequest(request: ArtistRequest) {
    const { data, error } = await supabase
      .from('artist_request')
      .insert([{
        id_artist: request.id_artist,
        id_req_type: request.id_req_type,
        title: request.title,
        instrument: request.instrument,
        short_desc: request.short_desc,
        long_desc: request.long_desc,
        propose_date: request.propose_date,
        id_host: request.id_host,
        status: request.status ?? 1
      }])
      .select('id');  // 👈 This line is required to return the generated ID

    if (error) throw error;
    return data?.[0]; // return just the inserted row (optional)
  }
/*
async uploadImageAndSaveData(
  file: File,
  videoTitle: string,
  videoUrl: string,
  idRequest: number,
  createdBy: string,
  authID: string
) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('artistrequest')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from('artistrequest')
      .getPublicUrl(filePath);

    const publicImageUrl = publicUrlData.publicUrl;

    // 3. Insert into artist_request_media
    const { data: insertData, error: insertError } = await supabase
      .from('artist_request_media')
      .insert([{
        id_media: 1,
        id_request: idRequest,
        title: videoTitle,
        image: publicImageUrl,
        description: videoUrl,
        created_by: createdBy,
        last_updated_by: createdBy,
        id_auth: authID
      }])
      .select('id') // 👈 Only return the `id` column

    if (insertError) throw insertError;
    const insertedId = insertData?.[0]?.id;

    return { success: true, imageUrl: publicImageUrl, id: insertedId };
  } catch (err) {
    // ✅ Fix for TS18046:
    let message = 'Unknown error';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    } else {
      try {
        message = JSON.stringify(err);
      } catch {
        message = 'Unhandled error';
      }
    }

    return { success: false, error: message };
  }
}
*/

async uploadImageAndSaveData(
  file: File | null,
  videoTitle: string,
  videoUrl: string,
  idRequest: number,
  createdBy: string,
  authID: string
) {
  try {
    let publicImageUrl: string | null = null;

    // 1. Upload only if file exists
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artistrequest')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('artistrequest')
        .getPublicUrl(filePath);

      publicImageUrl = publicUrlData.publicUrl;
    }

    // 2. Insert into DB, with or without image
    const { data, error: insertError } = await supabase
      .from('artist_request_media')
      .insert([{
        id_media: 1,
        id_request: idRequest,
        title: videoTitle,
        image: publicImageUrl, // will be null if no file
        description: videoUrl,
        created_by: createdBy,
        last_updated_by: createdBy,
        id_auth: authID
      }])
      .select('id'); // get ID of inserted row

    if (insertError) throw insertError;

    return {
      success: true,
      imageUrl: publicImageUrl,
      id: data?.[0]?.id || null
    };

  } catch (err) {
    let message = 'Unknown error';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    } else {
      try {
        message = JSON.stringify(err);
      } catch {
        message = 'Unhandled error';
      }
    }

    return { success: false, error: message };
  }
}




}
