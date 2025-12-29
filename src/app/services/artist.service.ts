import { Injectable, signal, effect } from '@angular/core';
import { supabase, supabase1 } from '../core/supabase';
import { BehaviorSubject, from, map, Observable } from 'rxjs';
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

  // Fetch artist FULL profile by artist_id
  async getArtistFullProfile(artistId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_artist_full_profile_v1', { artist_id: artistId });
    if (error) throw error;
    return data;
  }


  async getArtistProfile_v1(artistId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_artist_profile_v1', { artist_id: artistId });

    if (error) throw error;
    return data;
  }

  async getArtistProfile_v2(artistId: string): Promise<any> {
    console.log('Fetching artist profile for ID:', artistId);
    const { data, error } = await supabase.rpc('get_artist_full_profile_v2', { artist_id: artistId });

    if (error) {
      console.error('Error fetching artist profile:', error);
      throw error;
    }
    
    console.log('Artist profile data received:', data);
    return data;
  }


  async getArtistProfile_v3(artistId: string): Promise<any> {
    console.log('Fetching artist profile for ID:', artistId);
    const { data, error } = await supabase.rpc('get_artist_full_profile_v1', { artist_id: artistId });

    if (error) {
      console.error('Error fetching artist profile:', error);
      throw error;
    }
    
    console.log('Artist profile data received:', data);
    return data;
  }


  private artistProfileID = signal<string | null>(null);
  private artistProfile = signal<any>(null);
  private artistID = signal<string | null>(null);
  private loggedUserID = signal<string | null>(null);
  private hostNewArtistID = signal<string | null>(null);


  setArtistProfileID(id: string) {
    this.artistProfileID.set(id);
  }


setHostNewArtistID(id: string){
  this.hostNewArtistID.set(id);
}

getHostNewArtistID(){
  return  this.hostNewArtistID();
}


  setLoggedUserID(id:string){
       console.log('...ddddd...........', id)
    this.loggedUserID.set(id);
    console.log('..............', id)

  }

 getLoggedUserID(){
   return  this.loggedUserID();

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
        id_media_type: id_media,
        id_request: idRequest,
        title: videoTitle,
        image: publicImageUrl, // will be null if no file
        description: videoUrl,
        created_by: createdBy,
        last_update: createdBy,
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
  // Delete child media rows first to satisfy FK constraint
  const { error: mediaDeleteError } = await supabase
    .from('artist_request_media')
    .delete()
    .eq('id_request', id_request);

  if (mediaDeleteError) {
    throw mediaDeleteError;
  }

  // Then delete the parent request
  const { data, error } = await supabase
    .from('artist_request')
    .delete()
    .eq('id', id_request);

  if (error) {
    throw error;
  }

  return data;
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
  const{data, error} = await supabase.from ('artists').update({short_bio: short_bio, last_update: this.getCurrentTimestamp(), updated_by: userID}).eq('id',id_artist)
  if(error) throw error
  return data;
}

async updateLongBio(id_artist:any, long_bio:any, userID:any){
  const{data, error} = await supabase.from ('artists').update({long_bio: long_bio, last_update: this.getCurrentTimestamp(), updated_by: userID}).eq('id',id_artist)
  if(error) throw error
  return data;
}

async updateContact(id_artist:any, userID:any, email:any, phone:any, website:any, city:any, country:any){
  const{data, error} = await supabase.from ('artists').update({email: email,  website:website, phone:phone, city:city, country:country, last_update: this.getCurrentTimestamp(), updated_by: userID}).eq('id',id_artist)
  if(error) throw error
  return data;
}

async updateInfo(
  id_artist:any, 
  userID:any, 
  f_name:any, 
  l_name:any, 
  teaser:any){
  const{data, error} = await supabase.from ('artists').update({fname: f_name,  lname:l_name, teaser:teaser, last_update: this.getCurrentTimestamp(), updated_by: userID}).eq('id',id_artist)
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
      last_update: new Date().toISOString(),
      updated_by: authID
    })
    .eq('id', artistId);

      if (error) throw error
    
    return signedData.signedUrl;

  } catch (err) {
    console.error('Replace photo error:', err);
    throw err;
  }
}


async replaceArtistCover(
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
      cover: signedData.signedUrl,
      last_update: new Date().toISOString(),
      updated_by: authID
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
  console.log('🎨 Artist creation stage initiated');

  const email = arrData.personal.email?.trim() || '';
  if (!email) {
    return { code: 0, data: 'Email is required' };
  }

  // Validate email format
  if (!email.includes('@')) {
    return { code: 0, data: 'Invalid email format' };
  }

  let authUserId: string;

  try {
    // Step 1: Create user in auth.users using admin API
    console.log('Step 1: Creating auth user with email:', email);
    authUserId = await this.createOrUpdateAuthUser(
      email,
      arrData.personal.firstName,
      arrData.personal.lastName
    );
    console.log('✓ Auth user created, ID:', authUserId);

    // Verify email was set
    const { data: verifyData } = await this.getAuthUserById(authUserId);
    if (!verifyData?.user?.email) {
      console.warn('Email not set after creation, attempting fix...');
      await this.fixMissingEmail(authUserId, email);
    }

    // Step 2: Send activation email
    console.log('Step 2: Sending activation email...');
    try {
      await this.authService.resendConfirmation(email);
      console.log('✓ Activation email sent');
    } catch (emailError: any) {
      console.warn('Activation email failed, trying password reset:', emailError);
      try {
        await this.sendPasswordResetLink(email);
        console.log('✓ Password reset link sent as fallback');
      } catch (resetError) {
        console.warn('Password reset also failed:', resetError);
        // Don't fail the whole process if email sending fails
      }
    }

    // Step 3: Create/update user_profile with id_role = 3
    console.log('Step 3: Creating user_profile...');
    await this.createOrUpdateUserProfile(
      authUserId,
      {
        fname: arrData.personal.firstName,
        lname: arrData.personal.lastName,
        email: email,
        phone: arrData.personal.phone,
        city: arrData.personal.city,
        proviance: arrData.personal.province || arrData.personal.proviance,
        country: arrData.personal.country
      },
      arrData.id_auth
    );
    console.log('✓ user_profile created/updated');

    // Step 4: Create artist record
    console.log('Step 4: Creating artist record...');
    const id_artist = uuidv4();
    const artistData = {
      id_profile: authUserId, // Use auth user ID
      fname: arrData.personal.firstName,
      lname: arrData.personal.lastName,
      teaser: arrData.personal.tagline,
      short_bio: arrData.personal.shortBio,
      long_bio: arrData.personal.longBio,
      email: email,
      phone: arrData.personal.phone,
      website: arrData.personal.website,
      city: arrData.personal.city,
      country: arrData.personal.country,
      photo: arrData.personal.profilePic,
      created_by: arrData.id_auth
    };

    const artistResult = await this.createArtist(artistData);
    
    if (artistResult.code !== 1) {
      return { code: 0, data: `Failed to create artist: ${artistResult.data}` };
    }

    // Update the artist ID for subsequent steps
    this.setHostNewArtistID(artistResult.data.id || id_artist);

    console.log('✓ Artist created successfully, ID:', artistResult.data.id || id_artist);
    console.log('🎉 Artist creation completed successfully');

    return { 
      code: 1, 
      data: {
        id: artistResult.data.id || id_artist,
        id_profile: authUserId,
        email: email
      }
    };

  } catch (error: any) {
    console.error('❌ Error in createSingleArtist_step01:', error);
    return { code: 0, data: error.message || 'Failed to create artist' };
  }
}


async createProfile(profileArr:any){

  let profileData = {
//    id: profileArr.id,
    id_user: profileArr.id_user,
    id_role: 3,
    first_name: profileArr.first_name,
    last_name: profileArr.last_name,
    email: profileArr.email,
    phone: profileArr.phone,
    city: profileArr.city,
    //proviance: profileArr.proviance,
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

 console.log('Artist stage started', arr);
  try {
    const { data, error } = await supabase
      .from('artists')
      .insert(arr)
      .select(); // Select to get the inserted record with ID

    if (error) {
      console.error('Error creating artist:', error);
      return { code: 0, data: error.message };
    }
    
    // Return the first inserted record (should be only one)
    const insertedRecord = Array.isArray(data) ? data[0] : data;
    console.log('Artist created successfully:', insertedRecord);
    return { code: 1, data: insertedRecord };
  } catch (err: any) {
    console.error('Exception creating artist:', err);
    return { code: 0, data: err.message };
  }
}

//Get all the artists
async getAllArtists(){
  const {data, error} = await supabase1.from('vw_get_all_artists').select()
  if(error) throw error
  return data;
}

//Get all the artists instruments
async getArtistInstruments(arr:any){
  const {data, error} = await supabase.from('vw_artist_instruments')
  .select().eq('id_artist', arr.id_artist)
  if(error) throw error
  return data;
}

//Add instruments
async addInstruments(arr:any){
  const {data, error} = await supabase.from('artist_instruments').insert(arr);
  if(error) throw error
  return data
}


//Add instruments
async addPerformance1(arr:any){
  const {data, error} = await supabase.from('artist_performance').insert(arr);
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

async delPerformance1(id_artist:any, id_performance:any){
  const {data, error} = await supabase.from('artist_performance').delete().eq('id_artist', id_artist).eq('id_performance', id_performance)
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

// async updateArtistDetail(arr:any, id_artist:any){

// const {data, error} = await supabase.from('artists').update(arr)
//   .eq('id', id_artist)
    
// // add supabase function to update artist email 

//     if(error) throw error
//     return data;

    
  
// }

async updateArtistDetail(arr: any, id_artist: any) {
  // If email is included in the update payload, check and create user_profile if needed
  if (arr.email !== undefined && arr.email !== null) {
    // Step 1: Get the artist record to check id_profile
    const { data: artistData, error: fetchError } = await supabase
      .from('artists')
      .select('id_profile, fname, lname, phone, city, country')
      .eq('id', id_artist)
      .single();

    if (fetchError) throw fetchError;

    let authUserId: string | null = artistData?.id_profile || null;
    let needsUserProfile = false;

    // Step 2: Check if user_profile exists with this id_user
    if (authUserId) {
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('user_profile')
        .select('id_user')
        .eq('id_user', authUserId)
        .single();

      // If profile doesn't exist, we need to create user_profile (but reuse authUserId)
      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        console.log('user_profile not found for id_user:', authUserId);
        needsUserProfile = true; // Need to create user_profile, but auth user exists
      } else if (profileCheckError) {
        // Some other error occurred
        console.warn('Error checking user_profile:', profileCheckError);
      }
    }

    // Step 3: If no authUserId or no user_profile exists, create them
    if (!authUserId) {
      console.log('Creating new auth user and user_profile for artist:', id_artist);
      
      // Get artist data for creating user_profile
      const email = arr.email.trim().toLowerCase();
      const firstName = artistData?.fname || arr.fname || '';
      const lastName = artistData?.lname || arr.lname || '';

      // Create auth user
      authUserId = await this.createOrUpdateAuthUser(email, firstName, lastName);
      console.log('Auth user created with ID:', authUserId);

      // Create user_profile
      // Get logged user ID if available (you may need to pass this as parameter)
      // For now, using a default or getting from current session
      let loggedUser: string | null = null;
      try {
        const currentUser = await this.authService.getCurrentUser();
        loggedUser = currentUser?.id || null;
      } catch (e) {
        console.warn('Could not get current user for created_by:', e);
      }

      await this.createOrUpdateUserProfile(
        authUserId,
        {
          fname: firstName,
          lname: lastName,
          email: email,
          phone: artistData?.phone || arr.phone || null,
          city: artistData?.city || arr.city || null,
          country: artistData?.country || arr.country || null
        },
        loggedUser || authUserId // Use authUserId as fallback
      );
      console.log('user_profile created');

      // Update artist's id_profile to link to the new auth user
      const { error: updateProfileError } = await supabase
        .from('artists')
        .update({ id_profile: authUserId })
        .eq('id', id_artist);

      if (updateProfileError) {
        console.warn('Failed to update artist id_profile:', updateProfileError);
        // Don't throw - continue with email update
      }
    } else if (needsUserProfile && authUserId) {
      // Auth user exists but user_profile doesn't - create user_profile only
      console.log('Creating user_profile for existing auth user:', authUserId);
      
      const email = arr.email.trim().toLowerCase();
      const firstName = artistData?.fname || arr.fname || '';
      const lastName = artistData?.lname || arr.lname || '';

      // Get logged user ID if available
      let loggedUser: string | null = null;
      try {
        const currentUser = await this.authService.getCurrentUser();
        loggedUser = currentUser?.id || null;
      } catch (e) {
        console.warn('Could not get current user for created_by:', e);
      }

      await this.createOrUpdateUserProfile(
        authUserId,
        {
          fname: firstName,
          lname: lastName,
          email: email,
          phone: artistData?.phone || arr.phone || null,
          city: artistData?.city || arr.city || null,
          country: artistData?.country || arr.country || null
        },
        loggedUser || authUserId // Use authUserId as fallback
      );
      console.log('user_profile created for existing auth user');
    }

    // Step 4: Now update the artists table with the provided data
    const { data, error } = await supabase
      .from('artists')
      .update(arr)
      .eq('id', id_artist);

    if (error) throw error;

    // Step 5: Call fx_update_email to sync email to user_profile and auth.users
    const { error: emailError } = await supabase
      .rpc('fx_update_email', {
        p_email: arr.email,
        p_id_artists: id_artist,
      });

    if (emailError) {
      // Optional: Log or handle email sync failure separately
      console.warn('Email sync to user_profile/auth.users failed:', emailError);
      // Decide: throw emailError? Or let artist update succeed but flag inconsistency?
      // For strict consistency, uncomment:
      // throw emailError;
    }

    return data;
  } else {
    // No email update, just update the artists table
    const { data, error } = await supabase
      .from('artists')
      .update(arr)
      .eq('id', id_artist);

    if (error) throw error;
    return data;
  }
}

async updateVideoMedia(
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


async deleteArtistMedia(id:any){
  const {data, error} = await supabase.from('artist_media').delete().eq('id', id)
  if(error) throw error
  return data
}




  getUniquePerfromance(artist_id:any): Observable<any[]> {
    return new Observable(observer => {
      supabase.rpc('get_unassigned_performance_types', {
      artist_id: artist_id
    })        .then(({ data, error }) => {
      console.log('----getUniquePerfromance--------->:', data, error);
          if (error) {
            observer.error(error);
          } else {
            observer.next(data);
            observer.complete();
          }
        });
    });
  }

  getUniquePerfromance_v1(artist_id: any): Observable<any[]> {
    console.log('----1/3 RECEIVED artist_id--------->:', artist_id);
  
    return from(
      supabase.rpc('get_unassigned_performance_types_v1', {
        artist_id: Number(artist_id)
      })
    ).pipe(
      map(res => {
        console.log('----getUniquePerfromance_v1--------->:', res.data);
        if (res.error) throw res.error;
        return res.data;
      })
    );
  }
  


  async getAllPerfromance(){
  const {data, error} = await supabase.from('sys_artist_performance').select()
  if(error) throw error
  return data
}



  async deleteArtistPerfromance(id:any){
    console.log('---deleteArtistPerfromance--------->:', id);
  const {data, error} = await supabase.from('artist_performance').delete().eq('id', id)
  console.log('---deleteArtistPerfromance--------->:', data);
  if(error) throw error
  console.log('---error--------->:', error);
  return data
}

async deleteArtistPerfromance_v1(param:any){
  console.log('---deleteArtistPerfromance--------->:', param);
const {data, error} = await supabase.from('artist_performance').delete().eq('id_artist', param.id_artist).eq('id_performance', param.id_performance)
console.log('---deleteArtistPerfromance--------->:', data);
if(error) throw error
console.log('---error--------->:', error);
return data
}


async addPerformance(arr:any){

  const {data, error} = await supabase.from('artist_performance').insert(arr)
   if(error) throw error
  return data

}


async EditNewEduInfo(arr:any, id:any){
  const {data, error} = await supabase.from('artist_education').update(arr).eq('id',id)
   if(error) throw error
  return data
}

  async delNewEduInfo(id:any){
    
  const {data, error} = await supabase.from('artist_education').delete().eq('id', id)
  if(error) throw error
  return data
}


async addNewEdu(arr:any){
  const {data, error} = await supabase.from('artist_education').insert(arr)
   if(error) throw error
  return data
}

async addNewEdu1(arr:any){
  const {data, error} = await supabase.from('artist_education').insert(arr).select()
   if(error) throw error
  return data
}


async addNewAwd(arr:any){
  const {data, error} = await supabase.from('artist_awards').insert(arr)
   if(error) throw error
  return data

}


async addNewAwd1(arr:any){
  const {data, error} = await supabase.from('artist_awards').insert(arr).select()
   if(error) throw error
  return data

}



  async delNewAwaInfo(id:any){
  const {data, error} = await supabase.from('artist_awards').delete().eq('id', id)
  if(error) throw error
  return data
}

async EditNewAwdInfo(arr:any, id:any){
  console.log('-------....>', arr)
  const {data, error} = await supabase.from('artist_awards').update(arr).eq('id',id)
   if(error) throw error
  return data
}


async addNewMediaVideo(arr:any){
  const {data, error} = await supabase.from('artist_media').insert(arr)
   if(error) throw error
  return data

}


async addNewCDVideo(arr:any){
  const {data, error} = await supabase.from('artist_media').insert(arr)
   if(error) throw error
  return data

}

async  sendPasswordResetLink(email: string): Promise<void> {
  try {
    const redirectTo = `${window.location.origin}/reset/`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {  redirectTo
})
    
    if (error) {
      throw new Error(`Error sending reset link: ${error.message}`)
    }
    
    console.log('Password reset link sent successfully')
    // Optionally show success message to user
  } catch (error) {
    console.error('Failed to send reset link:', error)
    // Handle error appropriately
    throw error
  }
}


async resetPass(pass:any){
  const {data, error}  = await supabase.auth.updateUser({
    password: pass
  })
  if(error) throw error
  return data;
}



//Get all the artists Requests
async getAllArtistsRequests(){
  const {data, error} = await supabase
    .from('vw_get_artists_request')
    .select('*')
  
  if(error) {
    console.error('Error fetching artist requests:', error);
    throw error;
  }
  
  // Transform the data to match the expected format
  const transformed = (data || []).map((item: any) => ({
    ...item,
    id_request: item.id,
    name: `${item.fname || ''} ${item.lname || ''}`.trim(),
    request_type: item.domain || '',
    // If propose_date exists use it, otherwise create array with min date
    propose_date: item.propose_date || (item.min ? [item.min] : []),
    // Handle max date for period display if available
    max: item.max || null,
    created_on: item.created_on,
    status: item.status !== undefined ? item.status : 2  // Default to approved if not in view
  }));
  
  return transformed;
}

//Get single artists Request detail
async getRequestDetail(id:any){
  const {data, error} = await supabase.rpc('get_single_request_with_details_v2', {p_event_id:id})
  if(error) throw error
  return data;
}

// Get single request with details v1
async get_single_request_with_details_v1(eventId: any) {
  const { data, error } = await supabase.rpc('get_single_request_with_details_v1', { p_event_id: eventId });
  if (error) throw error;
  return data;

  
}


// Get single request with details v1
async get_single_request_with_details_v2(eventId: any) {
  const { data, error } = await supabase.rpc('get_single_request_with_details_v2', { p_event_id: eventId });
  if (error) throw error;
  return data;

  
}


// Add comment to event
async addEventComment(eventId: number, hostId: number | null, comment: string, artistId?: number) {
  const payload: any = {
    id_event: eventId,
    comment: comment
  };
  
  // Determine who is adding the comment
  if (hostId !== null && hostId !== undefined) {
    // Host is adding comment
    payload.id_host = hostId;
    payload.who = 1; // 1 = host
    if (artistId) {
      payload.id_artist = artistId;
    }
  } else if (artistId) {
    // Artist is adding comment
    payload.id_artist = artistId;
    payload.who = 2; // 2 = artist
  }
  
  const { data, error } = await supabase
    .from('event_comments')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get comment count for an event
async getEventCommentCount(eventId: number): Promise<number> {
  const { count, error } = await supabase
    .from('event_comments')
    .select('*', { count: 'exact', head: true })
    .eq('id_event', eventId);
  
  if (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }
  
  return count || 0;
}

  // Update request status and optional comment
  async updateRequestStatus(id: number, status: number, comment: string | null) {
    const payload: any = {
      status: status,
      last_status_change: new Date().toISOString()
    };
    if (comment !== undefined) {
      payload.comment = comment;
    }
    const { data, error } = await supabase
      .from('artist_request')
      .update(payload)
      .eq('id', id)
      .select('id, status, comment, last_status_change')
      .single();
    if (error) throw error;
    return data;
  }




  async HostUploadArtistMedia(
  id_media:number,
  id_artist: string,
  title: string,
  file: File | null,
  desc: string,
  url: string,
  created_by: string  
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
      .from('artist_media')
      .insert([{
        id_media: id_media,
        id_artist: id_artist,
        title: title,
        image: publicImageUrl, // will be null if no file
        description: desc,
        url:url,
        created_by: created_by,
        updated_by: created_by,
        last_update: new Date().toISOString()
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




async deleteHostsMedia(arr:any){
  const { data, error } = await supabase
  .storage
  .from('artistrequest')
  .remove([arr.url])

  if(error){
    throw error
  }else{
    const {data, error} = await supabase.from('artist_media').delete().eq('id', arr.id)
    if(error) throw error
    return data
  }
  return data
}


async artistRequest(arr:any, id:any){

  console.log('----back side', arr);
  console.log('----back id', id);
  
  const {data, error} = await supabase.from('artist_request').update(arr).eq('id', id)
  if(error) throw error
  return data
}

async getArtistRequirement(id:any){
  const {data, error} = await supabase.from('artist_requirement').select().eq('id_artist', id)
  if(error) throw error
  return data
}


async addArtistRequirement(arr:any){
  const {data, error} = await supabase.from('artist_requirement').insert(arr)
  if(error) throw error
  return data
}

async editArtistRequirement(arr:any, id:any){
  const {data, error} = await supabase.from('artist_requirement').update(arr).eq('id', id)
  if(error) throw error
  return data
}

async addArtistTimeOff(arr:any){
  const {data, error} = await supabase.from('artist_availability').insert(arr)
  if(error) throw error
  return data
}

async getArtistTimeOff(id:any){
  const {data, error} = await supabase.from('artist_availability').select().eq('id_artist', id)
  if(error) throw error
  return data
}

async deleteArtistTimeOff(id:any){
  const {data, error} = await supabase.from('artist_availability').delete().eq('id', id)
  if(error) throw error
  return data
}

async editArtistTimeOff(arr:any, id:any){
  const {data, error} = await supabase.from('artist_availability').update(arr).eq('id', id)
  if(error) throw error
  return data
}





  // Fetch events with their dates for a given artist via RPC
  async getEventsWithDates(artistId: string | number): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_events_with_dates', { p_id_artist: artistId });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  /**
   * Deletes an artist using the PostgreSQL function pont_delete_artist
   * @param artistId - The artist ID to delete
   */
  async deleteArtist(artistId: string): Promise<any> {
    const { data, error } = await supabase.rpc('pont_delete_artist', { 
      artist_id: parseInt(artistId) 
    });

    if (error) throw error;
    return data;
  }

  /**
   * Gets a user from Supabase auth.users by ID
   * @param userId - The user ID
   * Note: Uses service role key (supabase1) for admin privileges
   */
  async getAuthUserById(userId: string): Promise<any> {
    const { data, error } = await supabase1.auth.admin.getUserById(userId);
    if (error) throw error;
    return data;
  }

  /**
   * Fixes missing email in auth.users and user_profile for existing users
   * @param userId - The auth user ID
   * @param email - The email to set
   */
  async fixMissingEmail(userId: string, email: string): Promise<void> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log('🔧 Fixing missing email for user:', userId, 'email:', normalizedEmail);

      // Step 1: Update auth.users with retry logic
      let authUpdate: any = null;
      let authError: any = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        const result = await supabase1.auth.admin.updateUserById(userId, {
          email: normalizedEmail,
          email_confirm: false
        });

        authUpdate = result.data;
        authError = result.error;

        if (!authError && authUpdate?.user?.email) {
          const updatedEmail = authUpdate.user.email.trim().toLowerCase();
          if (updatedEmail === normalizedEmail) {
            console.log('✓ Email updated in auth.users:', updatedEmail);
            break;
          }
        }

        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`Retry ${retryCount} for auth.users email update...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (authError || !authUpdate?.user?.email) {
        console.error('❌ Failed to update email in auth.users after', maxRetries, 'attempts');
        throw new Error(`Failed to update email in auth.users: ${authError?.message || 'Email still empty after update'}`);
      }

      // Step 2: Update user_profile with retry logic
      retryCount = 0;
      let profileUpdate: any = null;
      let profileError: any = null;

      while (retryCount < maxRetries) {
        const result = await supabase
          .from('user_profile')
          .update({ email: normalizedEmail })
          .eq('id_user', userId)
          .select()
          .single();

        profileUpdate = result.data;
        profileError = result.error;

        if (!profileError && profileUpdate?.email) {
          const updatedEmail = profileUpdate.email.trim().toLowerCase();
          if (updatedEmail === normalizedEmail) {
            console.log('✓ Email updated in user_profile:', updatedEmail);
            break;
          }
        }

        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`Retry ${retryCount} for user_profile email update...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (profileError) {
        console.error('❌ Error updating email in user_profile:', profileError);
        // Don't throw - auth.users update succeeded, but log the error
        console.warn('⚠️ Email updated in auth.users but failed in user_profile. Manual fix may be needed.');
      } else if (!profileUpdate?.email) {
        console.warn('⚠️ user_profile update returned but email is still empty');
      } else {
        console.log('✓ Email successfully updated in both auth.users and user_profile');
      }

      // Final verification
      const { data: finalAuthCheck } = await supabase1.auth.admin.getUserById(userId);
      const { data: finalProfileCheck } = await supabase
        .from('user_profile')
        .select('email')
        .eq('id_user', userId)
        .single();

      console.log('Final verification:', {
        'auth.users.email': finalAuthCheck?.user?.email || 'MISSING',
        'user_profile.email': finalProfileCheck?.email || 'MISSING'
      });
    } catch (error: any) {
      console.error('❌ Error in fixMissingEmail:', error);
      throw error;
    }
  }

  /**
   * Deletes a user from Supabase auth.users
   * @param userId - The user ID (from id_user or id_profile)
   * Note: Uses service role key (supabase1) for admin privileges
   */
  async deleteAuthUser(userId: string): Promise<any> {
    // Using the service role client (supabase1) for admin privileges
    const { data, error } = await supabase1.auth.admin.deleteUser(userId);
    if (error) throw error;
    return data;
  }

  /**
   * Creates or updates a user in auth.users and returns the user ID
   * @param email - The email address
   * @param firstName - First name
   * @param lastName - Last name
   * @returns The auth user ID
   */
  async createOrUpdateAuthUser(email: string, firstName?: string, lastName?: string): Promise<string> {
    try {
      console.log('Creating/updating auth user:', { email, firstName, lastName });

      // Check if user with this email already exists
      const { data: existingUsers, error: listError } = await supabase1.auth.admin.listUsers();
      
      if (listError) {
        console.warn('Could not list users, proceeding with creation:', listError);
      }

      const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

      if (existingUser) {
        console.log('User already exists in auth.users:', existingUser.id);
        // Update email if different
        if (existingUser.email !== email) {
          const { data: updateData, error: updateError } = await supabase1.auth.admin.updateUserById(existingUser.id, {
            email: email,
            email_confirm: false
          });
          if (updateError) throw updateError;
          console.log('Email updated for existing user');
        }
        return existingUser.id;
      }

      // Create new user in auth.users
      // Note: email must be a valid email string
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw new Error('Invalid email address provided');
      }

      const normalizedEmail = email.trim().toLowerCase();
      console.log('Creating auth user with email:', normalizedEmail);
      
      // Try creating user with email
      let createData: any;
      let createError: any;
      
      try {
        const result = await supabase1.auth.admin.createUser({
          email: normalizedEmail,
          email_confirm: false,
          user_metadata: {
            first_name: firstName || '',
            last_name: lastName || ''
          }
        });
        createData = result.data;
        createError = result.error;
      } catch (err: any) {
        createError = err;
        console.error('Exception creating user:', err);
      }

      if (createError) {
        console.error('Error creating auth user:', createError);
        throw new Error(`Failed to create auth user: ${createError.message}`);
      }

      if (!createData?.user?.id) {
        throw new Error('User created but no ID returned');
      }

      const createdUserId = createData.user.id;
      console.log('New auth user created with ID:', createdUserId);
      console.log('Initial created user data:', {
        id: createData.user.id,
        email: createData.user.email || 'MISSING',
        email_confirmed_at: createData.user.email_confirmed_at
      });
      
      // CRITICAL: Immediately update the email if it's missing
      // Sometimes createUser doesn't set email correctly
      if (!createData.user.email || createData.user.email.trim() === '') {
        console.warn('Email is missing after creation! Attempting immediate fix...');
        const { data: immediateFix, error: immediateError } = await supabase1.auth.admin.updateUserById(createdUserId, {
          email: normalizedEmail,
          email_confirm: false
        });
        
        if (immediateError) {
          console.error('Immediate email fix failed:', immediateError);
          throw new Error(`User created but email not set and fix failed: ${immediateError.message}`);
        }
        
        if (!immediateFix?.user?.email) {
          throw new Error('Email update returned but email is still empty');
        }
        
        console.log('Email fixed immediately after creation:', immediateFix.user.email);
        createData.user.email = immediateFix.user.email; // Update local reference
      }

      // Final verification - fetch user again to ensure email is set
      let retryCount = 0;
      const maxRetries = 3;
      let emailSet = false;
      
      while (retryCount < maxRetries && !emailSet) {
        const { data: verifyData, error: verifyError } = await supabase1.auth.admin.getUserById(createdUserId);
        
        if (verifyError) {
          console.warn(`Verification attempt ${retryCount + 1} failed:`, verifyError);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
            continue;
          }
          break;
        }
        
        const verifiedEmail = verifyData.user.email?.trim().toLowerCase() || '';
        
        if (verifiedEmail === normalizedEmail) {
          console.log('✓ Email verified successfully:', verifiedEmail);
          emailSet = true;
          break;
        }
        
        console.warn(`Verification attempt ${retryCount + 1}: Email mismatch. Expected: ${normalizedEmail}, Got: ${verifiedEmail}`);
        
        // Try to fix it
        const { data: fixData, error: fixError } = await supabase1.auth.admin.updateUserById(createdUserId, {
          email: normalizedEmail,
          email_confirm: false
        });
        
        if (fixError) {
          console.error(`Fix attempt ${retryCount + 1} failed:`, fixError);
        } else if (fixData?.user?.email) {
          console.log(`Fix attempt ${retryCount + 1} succeeded:`, fixData.user.email);
          if (fixData.user.email.trim().toLowerCase() === normalizedEmail) {
            emailSet = true;
            break;
          }
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait before next retry
        }
      }
      
      if (!emailSet) {
        throw new Error(`Failed to set email after ${maxRetries} attempts. User ID: ${createdUserId}, Expected email: ${normalizedEmail}`);
      }

      return createdUserId;
    } catch (error: any) {
      console.error('Error in createOrUpdateAuthUser:', error);
      throw error;
    }
  }

  /**
   * Creates or updates user_profile record
   * @param userId - The auth user ID
   * @param artistData - Artist data
   * @param loggedUser - Logged in user ID
   * @returns The user_profile record
   */
  async createOrUpdateUserProfile(userId: string, artistData: any, loggedUser: string): Promise<any> {
    try {
      console.log('Creating/updating user_profile:', { userId, artistData });

      // Check if user_profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profile')
        .select('*')
        .eq('id_user', userId)
        .single();

      // Ensure email is properly extracted and normalized
      let email = artistData.email?.trim() || '';
      
      // ALWAYS fetch email from auth.users to ensure we have the correct one
      try {
        const { data: authUser, error: authError } = await supabase1.auth.admin.getUserById(userId);
        if (!authError && authUser?.user?.email) {
          const authEmail = authUser.user.email.trim().toLowerCase();
          if (authEmail) {
            email = authEmail;
            console.log('Using email from auth.users:', email);
          }
        }
      } catch (e) {
        console.warn('Could not fetch email from auth.users:', e);
      }
      
      // If still no email, use the one from artistData
      if (!email && artistData.email) {
        email = artistData.email.trim().toLowerCase();
        console.log('Using email from artistData:', email);
      }
      
      if (!email) {
        throw new Error('Email is required for user_profile. Please ensure email is set in auth.users or artist profile.');
      }

      email = email.toLowerCase(); // Normalize email
      console.log('Creating/updating user_profile with email:', email);

      const profileData: any = {
        id_user: userId,
        id_role: 3, // Artist role
        first_name: artistData.fname || artistData.first_name || '',
        last_name: artistData.lname || artistData.last_name || '',
        email: email, // Ensure email is set
        phone: artistData.phone || null,
        city: artistData.city || null,
        proviance: artistData.proviance || artistData.province || null,
        country: artistData.country || null,
        updated_by: loggedUser,
        last_update: new Date().toISOString()
      };

      if (fetchError && fetchError.code === 'PGRST116') {
        // No existing profile, create new one
        profileData.created_by = loggedUser;
        const { data: insertData, error: insertError } = await supabase
          .from('user_profile')
          .insert(profileData)
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user_profile:', insertError);
          throw new Error(`Failed to create user_profile: ${insertError.message}`);
        }

        console.log('New user_profile created:', insertData);
        console.log('user_profile email verification:', insertData?.email);
        
        // Verify email was stored
        if (!insertData?.email || insertData.email !== email) {
          console.error('Email not stored correctly in user_profile!', {
            expected: email,
            got: insertData?.email
          });
          // Try to update it
          const { data: fixData, error: fixError } = await supabase
            .from('user_profile')
            .update({ email: email })
            .eq('id_user', userId)
            .select()
            .single();
          
          if (fixError) {
            console.error('Failed to fix email in user_profile:', fixError);
          } else {
            console.log('Email fixed in user_profile:', fixData?.email);
            return fixData;
          }
        }
        
        return insertData;
      } else if (existingProfile) {
        // Update existing profile
        const { data: updateData, error: updateError } = await supabase
          .from('user_profile')
          .update(profileData)
          .eq('id_user', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user_profile:', updateError);
          throw new Error(`Failed to update user_profile: ${updateError.message}`);
        }

        console.log('user_profile updated:', updateData);
        console.log('user_profile email verification:', updateData?.email);
        
        // Verify email was stored
        if (!updateData?.email || updateData.email !== email) {
          console.error('Email not stored correctly in user_profile update!', {
            expected: email,
            got: updateData?.email
          });
          // Try to update it again
          const { data: fixData, error: fixError } = await supabase
            .from('user_profile')
            .update({ email: email })
            .eq('id_user', userId)
            .select()
            .single();
          
          if (fixError) {
            console.error('Failed to fix email in user_profile:', fixError);
          } else {
            console.log('Email fixed in user_profile:', fixData?.email);
            return fixData;
          }
        }
        
        return updateData;
      } else {
        throw new Error('Unexpected error checking user_profile');
      }
    } catch (error: any) {
      console.error('Error in createOrUpdateUserProfile:', error);
      throw error;
    }
  }

  /**
   * Updates a user's email in Supabase auth.users and sends confirmation
   * @param userId - The user ID (from id_user or id_profile)
   * @param newEmail - The new email address
   * Note: Uses service role key (supabase1) for admin privileges
   */
  async updateAuthUserEmail(userId: string, newEmail: string): Promise<any> {
    try {
      console.log('Updating auth user email:', { userId, newEmail, userIdType: typeof userId });
      
      // Validate userId format (should be UUID)
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID provided');
      }

      // Step 1: Verify user exists (optional check, but helpful for debugging)
      try {
        const { data: userData, error: getUserError } = await supabase1.auth.admin.getUserById(userId);
        if (getUserError) {
          console.warn('Could not fetch user before update (may not exist):', getUserError);
        } else {
          console.log('User found before update:', {
            id: userData.user?.id,
            email: userData.user?.email,
            email_confirmed_at: userData.user?.email_confirmed_at
          });
        }
      } catch (checkError) {
        console.warn('User check failed (continuing anyway):', checkError);
      }
      
      // Step 2: Update the email in auth.users with email_confirm: false
      // This marks the email as unconfirmed
      const { data: updateData, error: updateError } = await supabase1.auth.admin.updateUserById(userId, {
        email: newEmail,
        email_confirm: false  // Mark as unconfirmed to trigger confirmation
      });
      
      if (updateError) {
        console.error('Error updating auth user email:', updateError);
        console.error('Error details:', {
          message: updateError.message,
          status: updateError.status,
          name: updateError.name
        });
        throw new Error(`Failed to update auth user email: ${updateError.message}`);
      }
      
      if (!updateData || !updateData.user) {
        throw new Error('Update succeeded but no user data returned');
      }
      
      console.log('Auth user email updated successfully:', updateData);
      console.log('Updated user data:', {
        id: updateData.user.id,
        email: updateData.user.email,
        email_confirmed_at: updateData.user.email_confirmed_at,
        created_at: updateData.user.created_at
      });

      // Verify the update worked
      if (updateData.user.email !== newEmail) {
        console.warn('Email mismatch! Expected:', newEmail, 'Got:', updateData.user.email);
      } else {
        console.log('✓ Email successfully updated in auth.users');
      }

      // Step 2: Use admin API to generate an invitation link
      // This creates a link that can be used for account activation
      const redirectTo = `${window.location.origin}/confirm-artist`;
      
      try {
        // Generate an invitation link (best option for existing users with email change)
        const { data: inviteData, error: inviteError } = await supabase1.auth.admin.generateLink({
          type: 'invite',
          email: newEmail,
          options: {
            redirectTo: redirectTo
          }
        });

        if (inviteError) {
          console.warn('Invite link generation failed:', inviteError);
          // Don't throw - email update succeeded, we'll use password reset as fallback
        } else {
          console.log('Invite link generated:', inviteData.properties?.action_link);
        }
      } catch (linkGenError) {
        console.warn('Link generation error (non-critical):', linkGenError);
      }

      return updateData;
    } catch (error: any) {
      console.error('Error in updateAuthUserEmail:', error);
      throw error;
    }
  }
    
  // Send signup email to new artist
  async sendArtistSignupEmail(email: string, name: string): Promise<void> {
    try {
      // Use Supabase auth to send magic link / invitation
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/artist/signup`,
          data: {
            name: name,
            invited_as: 'artist'
          }
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending signup email:', error);
      throw new Error('Failed to send signup email: ' + error.message);
    }
  }

  // Add pending artist to database
  async addPendingArtist(name: string, email: string): Promise<string> {
    try {
      const nameParts = name.trim().split(' ');
      const fname = nameParts[0] || '';
      const lname = nameParts.slice(1).join(' ') || '';

      const { data, error } = await supabase
        .from('artists')
        .insert({
          fname: fname,
          lname: lname,
          email: email,
          created_on: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error adding pending artist:', error);
      throw new Error('Failed to add pending artist: ' + error.message);
    }
  }

  // Get host ID (integer) from host_users table based on profile ID
  async getHostIdFromProfile(profileId: string): Promise<number> {
    try {
      console.log('Querying host_users table for profile ID:', profileId);
      console.log('Profile ID type:', typeof profileId);
      console.log('Profile ID length:', profileId?.length);
      
      // First, let's see all records in host_users for debugging
      const { data: allRecords } = await supabase
        .from('host_users')
        .select('*');
      console.log('All host_users records:', allRecords);
      
      const { data, error } = await supabase
        .from('host_users')
        .select('id_host')
        .eq('id_profile', profileId)
        .single();

      console.log('Query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Host not found in host_users table: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from host_users table');
        throw new Error('Host profile not found in host_users table');
      }

      console.log('Found host ID:', data.id_host);
      return data.id_host;
    } catch (error: any) {
      console.error('Error getting host ID:', error);
      throw error;
    }
  }
}
