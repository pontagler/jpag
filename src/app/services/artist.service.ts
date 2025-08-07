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

async uploadImageAndSaveData(
  file: File | null,
  videoTitle: string,
  videoUrl: string,
  idRequest: number,
  createdBy: string,
  authID: string,
  id_media:number
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
        id_media: id_media,
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

async deleteMedia(id: number) {
  try {
    // 1. Fetch the media entry to get image URL (if any)
    const { data, error: fetchError } = await supabase
      .from('artist_request_media')
      .select('image')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const imageUrl: string | null = data?.image || null;

    // 2. If image URL exists, parse it to get the file path & delete from storage
    if (imageUrl) {
      // Example image URL: https://xxxx.supabase.co/storage/v1/object/public/artistrequest/yourfile.jpg
      const filePath = imageUrl.split('/artistrequest/')[1];
      if (filePath) {
        const { error: storageDeleteError } = await supabase.storage
          .from('artistrequest')
          .remove([filePath]);

        if (storageDeleteError) throw storageDeleteError;
      }
    }

    // 3. Delete the DB row
    const { error: deleteError } = await supabase
      .from('artist_request_media')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return { success: true };

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

async getArtistRequests(artistId: string) {
  const { data, error } = await supabase
    .from('artist_request')
    .select()
    .eq('id_artist', artistId)
    .order('created_on', { ascending: false }); // sort descending (latest first)

  if (error) throw error;
  return data;
}

async delArtistRequest(id_request:number){
  const{data, error} = await supabase.from('artist_request').delete().eq('id', id_request)

  if(error){
    throw error;
  }else{
    await supabase.from('artist_request_media').delete().eq('id', id_request)
    if (error) throw error
    return data;
  }
}

getCurrentTimestamp() {
  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1); // Months are 0-based
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}




async updateShortBio(id_artist:any, short_bio:any, userID:any){
  const{data, error} = await supabase.from ('artists').update({short_bio: short_bio, last_updated: this.getCurrentTimestamp(), last_updated_by: userID}).eq('id',id_artist)
  if(error) throw error
  return data;
}

async updateLongBio(id_artist:any, long_bio:any, userID:any){
  const{data, error} = await supabase.from ('artists').update({long_bio: long_bio, last_updated: this.getCurrentTimestamp(), last_updated_by: userID}).eq('id',id_artist)
  if(error) throw error
  return data;
}

async updateContact(id_artist:any, userID:any, email:any, phone:any, website:any, city:any, country:any){
  const{data, error} = await supabase.from ('artists').update({email: email,  website:website, phone:phone, city:city, country:country, last_updated: this.getCurrentTimestamp(), last_updated_by: userID}).eq('id',id_artist)
  if(error) throw error
  return data;
}

}
