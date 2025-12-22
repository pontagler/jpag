import { Injectable, signal, effect } from '@angular/core';
import { supabase, supabase1 } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})


export class AccountService {

  constructor(
    private authService: AuthService
  ) { }

async getAccountList(){
  const {data, error} = await supabase.from('user_profile').select().eq('id_role', 1)
  if(error) throw error
  return data;
}

async getAccountById(id_user: string){
  // Prefer view with rolename
  const { data, error } = await supabase
    .from('vw_user_profile_role')
    .select('*')
    .eq('id_user', id_user)
    .single();
  if (error) throw error;
  return data;
}



  /**
   * Create service to add new auth data in storage
   */

async createNewAdmin(arr: any) {

    console.log(arr);

  try {
    // 1. Get id_host from host_users table for the logged-in user
    const loggedInUser = await this.authService.getCurrentUser();
    if (!loggedInUser?.id) {
      throw new Error('Logged-in user not found');
    }

    const { data: hostUserData, error: hostUserError } = await supabase
      .from('host_users')
      .select('id_host')
      .eq('id_profile', loggedInUser.id)
      .single();

    if (hostUserError || !hostUserData) {
      throw new Error('Host ID not found for logged-in user. Please ensure you are associated with a host.');
    }

    const id_host = hostUserData.id_host;

    // 2. Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: arr.email,
      password: arr.password
    });

    if (error) throw error;
    if (!data?.user) throw new Error('User not created');

    let id_user = data.user.id;

    // 3. Store user details in user_profile table
    // Note: id is auto-generated (serial), so we don't include it
    let dataArray = {
      id_user: id_user,  // auth.users.id
      id_role: 1, // default role (Admin)
      first_name: arr.fname,
      last_name: arr.lname,
      email: arr.email,
      phone: arr.phone,
      city: arr.city,       // ✅ fixed typo ("ciity")
      proviance: arr.province, // ✅ fixed typo ("proviance")
      country: arr.country,
      created_by: arr.id_logged,
      id_active: true
    };

    const { data: inserted, error: insertError } = await supabase
      .from('user_profile')
      .insert(dataArray)
      .select(); // 👈 return inserted row(s)

    if (insertError) throw insertError;

    // 4. Save id_profile and id_host into host_users table
    const { error: hostUsersError } = await supabase
      .from('host_users')
      .insert({
        id_profile: id_user,  // The new user's auth ID (UUID)
        id_host: id_host      // The host ID from the logged-in user
      });

    if (hostUsersError) {
      console.error('Error inserting into host_users:', hostUsersError);
      throw new Error(`Failed to associate user with host: ${hostUsersError.message}`);
    }

    return inserted;
  } catch (err) {
    console.error('Error creating new admin:', err);
    throw err;
  }
}




}