import { Injectable, signal, effect } from '@angular/core';
import { supabase, supabase1 } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';



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

  constructor(
    private authService: AuthService
  ) { }
  
  async uploadPublicProfilePhoto(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = `profiles/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('artistrequest')
      .upload(filePath, file);
    if (uploadError) throw uploadError;
    
    const { data: publicUrlData } = supabase.storage
      .from('artistrequest')
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }
  //Fetch artist profile by ID
  async getArtistProfile(artistId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_artist_profile', { artist_id: artistId });

    if (error) throw error;
    return data;
  }


  async getArtistProfile_v1(artistId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_artist_profile_v1', { artist_id: artistId });

    if (error) throw error;
    return data;
  }


  private artistProfileID = signal<string | null>(null);
  private artistProfile = signal<any>(null);
  private artistID = signal<string | null>(null);
  private logedUserID = signal<string | null>(null);

  setArtistProfileID(id: string) {
    this.artistProfileID.set(id);
  }

  setLogedUserID(id:string){
       console.log('...ddddd...........', id)
    this.logedUserID.set(id);
    console.log('..............', id)

  }

 getLogedUserID(){
   return  this.logedUserID();

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

async updateInfo(
  id_artist:any, 
  userID:any, 
  f_name:any, 
  l_name:any, 
  tagline:any){
  const{data, error} = await supabase.from ('artists').update({fname: f_name,  lname:l_name, tagline:tagline, last_updated: this.getCurrentTimestamp(), last_updated_by: userID}).eq('id',id_artist)
  if(error) throw error
  return data;
}

async replaceArtistPhoto(
  artistId: string,
  authID:string,
  oldPhotoUrl: string | null,
  file: File
): Promise<string> {
  try {
    // ✅ Delete old file only if it exists
    if (oldPhotoUrl && oldPhotoUrl.includes('/storage/v1/object/')) {
      const decodedUrl = decodeURIComponent(oldPhotoUrl);
      const path = decodedUrl.split('/object/')[1].split('?')[0];

      if (path) {
        await supabase.storage.from('artistrequest').remove([path]);
      }
    }

    // New file path
    const fileName = `${artistId}-${Date.now()}-${file.name}`;
    const filePath = `artists/${fileName}`;

    // Upload new file (upsert in case path already exists)
    const { error: uploadError } = await supabase.storage
      .from('artistrequest')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Generate signed URL (1 year expiry)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('artistrequest')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (signedError) throw signedError;

    // signedData.signedUrl;

     const {data, error } = await supabase
    .from('artists')
    .update({
      photo: signedData.signedUrl,
      last_updated: new Date().toISOString(),
      last_updated_by: authID
    })
    .eq('id', artistId);

      if (error) throw error
    
    return signedData.signedUrl;

  } catch (err) {
    console.error('Replace photo error:', err);
    throw err;
  }
}

async createSingleArtist_temp(arrData: any) {
  console.log(arrData);
  return arrData
}

async createSingleArtist_step01(arrData: any) {
  console.log('Signup stage initiated');

  let signupData: any;

  try {
    signupData = await this.authService.createNewUser(arrData.personal.email).then((res)=>{
      return { code: 1, data:res}
    })
  } catch (error: any) {
    return { code: 0, data: error.message };
  }

  console.log('Signup response:', signupData);

  if (signupData.code !== 1) {
    return signupData; // Stop if signup failed
  }

  console.log('Signup stage cleared', signupData);

  // Step 2: Create profile
  const idProfile = uuidv4();

  const profileData = {
    id: idProfile,
    id_user: signupData.data.user.id, // From created Supabase user
    id_role: 'c9b3a78d-a288-42ce-9a88-a1d9a11bef08',
    first_name: arrData.personal.firstName,
    last_name: arrData.personal.lastName,
    email: arrData.personal.email, // fixed typo
    phone: arrData.personal.phone,
    city: arrData.personal.city,
    proviance: arrData.personal.province,
    country: arrData.personal.country,
    created_by: arrData.id_auth
  };

  console.log('Profile stage initiated', profileData);

  const resCode = await this.createProfile(profileData);

  if (resCode.code !== 1) {
    return resCode; // Stop if profile creation failed
  }

  console.log('Profile stage cleared', resCode);

  // Step 3: Create artist
  const artistData = {
    id: uuidv4(),
    id_profile: profileData.id, // fixed to use profile ID only
    fname: arrData.personal.firstName,
    lname: arrData.personal.lastName,
    tagline: arrData.personal.tagline,
    short_bio: arrData.personal.shortBio,
    long_bio: arrData.personal.longBio,
    email: arrData.personal.email,
    phone: arrData.personal.phone,
    website: arrData.personal.website,
    city: arrData.personal.city,
    proviance: arrData.personal.province,
    country: arrData.personal.country,
    photo: arrData.personal.profilePic,
    created_by: arrData.id_auth
  };

  console.log('Artist stage initiated', artistData);

  const artCode = await this.createArtist(artistData);

  console.log('Artist stage cleared', artCode);

  return artCode;
}


async createProfile(profileArr:any){

  let profileData = {
    id: profileArr.id,
    id_user: profileArr.id_user,
    id_role: profileArr.id_role,
    first_name: profileArr.first_name,
    last_name: profileArr.last_name,
    email: profileArr.email,
    phone: profileArr.phone,
    city: profileArr.city,
    proviance: profileArr.proviance,
    country: profileArr.country,
    created_by: profileArr.created_by
  }
   console.log('Profile Stage started', profileData);


try {
    const { data, error } = await supabase
      .from('user_profile')
      .insert(profileData);

    if (error) {
      return { code: 0, data: error.message };
    }
    return { code: 1, data };
  } catch (err: any) {
    return { code: 0, data: err.message };
  }
}

async createArtist(arr:any){

 console.log('Artist Sage started', arr);
  try {
    const { data, error } = await supabase
      .from('artists')
      .insert(arr);

    if (error) {
      return { code: 0, data: error.message };
    }
    return { code: 1, data };
  } catch (err: any) {
    return { code: 0, data: err.message };
  }
}

//Get all the artists
async getAllArtists(){
  const {data, error} = await supabase.from('vw_get_all_artists').select()
  if(error) throw error
  return data;
}

//Add instruments
async addInstruments(arr:any){
  const {data, error} = await supabase.from('artist_instruments').insert(arr);
  if(error) throw error
  return data
}

//Delete instruments
async delInstruments(id_artist:any, id_instrument:any){
  const {data, error} = await supabase.from('artist_instruments').delete().eq('id_artist', id_artist).eq('id_instrument', id_instrument)
  if(error) throw error
  console.log(data);
  return data;
}

//update artist system 
async updateArtistStatus(arr:any, id_artist:any){
  const {data, error} = await supabase
  .from('artists')
  .update(arr)
  .eq('id', id_artist)
  if(error) throw error
  return data;
}

// Ipdate artist Detail

async updateArtistDetail(arr:any, id_artist:any, id:any){
  await supabase
  .from('artists')
  .update(arr)
  .eq('id', id_artist).then(async()=>{
    const {data, error } = await supabase1.rpc('fx_update_email_auth_user', {
      p_email: arr.email,
      p_id_artist: id_artist
    })
    
    if(error) throw error
    return data;
    
  })
  
}







}
