// auth.service.ts
import { Injectable, signal, effect } from '@angular/core';
import { supabase } from '../core/supabase';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable for session data
  private session$ = new BehaviorSubject<any>(null);
  private sessionReady$ = new BehaviorSubject<boolean>(false);

  // Signals to manage authentication state
  userEmailAuth = signal<boolean | null>(null);
  sigUserID = signal<string | null>(null);

  // Subject to emit changes from signals as observables
  private userEmailAuthSubject = new BehaviorSubject<boolean | null>(null);

  constructor() {
    // On app load, restore session from Supabase and update internal state
    this.initAuth();
  }

  private async initAuth() {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user || null;
      if (user) {
        this.session$.next(user);
        this.userEmailAuth.set(true);
        this.sigUserID.set(user.id);
      } else {
        this.session$.next(null);
        this.userEmailAuth.set(false);
        this.sigUserID.set(null);
      }

      // Keep signals in sync with auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        const sUser = session?.user || null;
        this.session$.next(session);
        this.userEmailAuth.set(!!sUser);
        this.sigUserID.set(sUser ? sUser.id : null);
      });
    } catch (_err) {
      // Best-effort init; leave defaults if supabase is unreachable
    }
  }

  /**
   * Checks if the user is currently logged in.
   */
  isLoggedIn(): boolean {
    return !!this.session$.getValue();
  }

  /**
   * Signs in a user using email and password.
   * Updates signals and fetches additional user info after login.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Fetch additional user information from database
    const userInfo = await this.getUserInfo(data.user.id);

    // Update signals with authenticated state and user ID
    this.userEmailAuth.set(true);
    this.sigUserID.set(data.user.id);

    const user = {
      ...data.user,
      ...userInfo
    };

    return user;
  }

  /**
   * Signs out the current user.
   * Resets all authentication-related signals.
   */
  async signOut() {
    const signout = await supabase.auth.signOut();
    console.log('Sign out successful:', signout);

    // Reset signals upon logout
    this.userEmailAuth.set(false);
    this.sigUserID.set(null);
    this.session$.next(null);
  }

  /**
   * Gets the currently logged-in user from Supabase.
   */
  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  /**
   * Retrieves additional user profile data from the database.
   */
  async getUserInfo(id_user: string) {
    const { data, error } = await supabase
      .from('vw_user_profile_role')
      .select('*')
      .eq('id_user', id_user)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Changes the password of the current user.
   */
  async changePassword(new_password: any) {
    const { data, error } = await supabase.auth.updateUser({
      password: new_password
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sends a password reset email via Supabase.
   * The redirect returns the user to the login page where recovery is handled.
   */
  async requestPasswordReset(email: string) {
    const redirectTo = `${window.location.origin}/artistspace/login`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) throw error;
    return data;
  }

  /**
   * Creates a new user account via email and optional password.
   * Sends confirmation email to the provided address.
   */
  async createNewUser(email: any, password: any = 'qwerty') {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'http://localhost:4200/confirm-artist'
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Resends the signup confirmation email.
   */
  async resendConfirmation(email: any) {
    console.log(email);
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: 'http://localhost:4200/confirm-artist'
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sends a magic link to the user's email for login.
   */
  async magicLink(email: any) {
    console.log(email);
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: 'http://localhost:4200/confirm-artist' }
    });

    if (error) throw error;
    return data;
  }




}