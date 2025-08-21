import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { supabase } from '../../../core/supabase';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  standalone: false
})
export class AccountComponent implements OnInit {
  constructor(
    private router: Router,
    private alertService: AlertService
  ) {}

  // Filters
  searchQuery: string = '';
  statusFilter: 'All' | '1' | '0' = 'All';
  countryFilter: 'All' | string = 'All';

  // Sorting
  sortKey: keyof Account = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  accounts: Account[] = [];

  ngOnInit(): void {
    this.getAllAccounts();
  }

  get uniqueCountries(): string[] {
    const countries = new Set<string>();
    for (const acc of this.accounts) {
      if (acc.country && acc.country.trim().length > 0) {
        countries.add(acc.country);
      }
    }
    return Array.from(countries).sort((a, b) => a.localeCompare(b));
  }

  get displayedAccounts(): Account[] {
    let result = this.accounts.filter((a) => {
      const q = this.searchQuery?.toLowerCase().trim();
      const matchesSearch = q
        ? (a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.phone?.toLowerCase().includes(q))
        : true;
      const matchesStatus = this.statusFilter === 'All' ? true : String(a.status) === this.statusFilter;
      const matchesCountry = this.countryFilter === 'All' ? true : a.country === this.countryFilter;
      return matchesSearch && matchesStatus && matchesCountry;
    });

    const key = this.sortKey;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    result.sort((a: Account, b: Account) => {
      const va = a[key] as any;
      const vb = b[key] as any;

      if (va instanceof Date && vb instanceof Date) {
        return (va.getTime() - vb.getTime()) * dir;
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * dir;
      }
      if (typeof va === 'boolean' && typeof vb === 'boolean') {
        return ((va === vb ? 0 : va ? 1 : -1) as number) * dir;
      }
      return String(va ?? '').localeCompare(String(vb ?? '')) * dir;
    });

    return result;
  }

  setSort(key: keyof Account): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }

  async getAllAccounts(): Promise<void> {
    try {
      // Prefer view with role info; fallback to user_profile
      const { data, error } = await supabase.from('vw_user_profile_role').select('*').eq('id_role', '2f7d3ac7-6144-4b1a-9093-3c1a1b0d5270');
      if (error) throw error;
      this.accounts = (data || []).map((row: any) => this.mapRowToAccount(row));
    } catch (e1: any) {
      try {
        const { data: data2, error: err2 } = await supabase.from('user_profile').select('*');
        if (err2) throw err2;
        this.accounts = (data2 || []).map((row: any) => this.mapRowToAccount(row));
      } catch (e2: any) {
        this.alertService.showAlert('Internal Error', e2.message || 'Failed to load accounts', 'error');
      }
    }
  }

  private mapRowToAccount(row: any): Account {
    const firstName = row.first_name || row.fname || '';
    const lastName = row.last_name || row.lname || '';
    const fullName = row.name || `${firstName} ${lastName}`.trim();

    const createdRaw = row.created_on ?? row.created_at ?? null;
    const updatedRaw = row.last_updated ?? row.last_update_on ?? row.updated_at ?? null;

    const statusVal = row.status ?? (typeof row.is_active === 'boolean' ? (row.is_active ? 1 : 0) : undefined);

    return {
      id_user: row.id_user || row.id || '',
      name: fullName,
      email: row.email ?? '',
      phone: row.phone ?? '',
      city: row.city ?? '',
      country: row.country ?? '',
      createdAt: createdRaw ? new Date(createdRaw) : undefined as unknown as Date,
      lastUpdated: updatedRaw ? new Date(updatedRaw) : undefined,
      status: typeof statusVal === 'number' ? statusVal : 1
    } as Account;
  }

  createNew(): void {
    // Adjust route when create account page is available
    this.router.navigate(['/hosts/console/account/create']);
  }

  viewDetail(a: Account): void {
    if (!a?.id_user) {
      this.alertService.showAlert('Invalid record', 'Missing user identifier', 'error');
      return;
    }
    this.router.navigate(['/hosts/console/account', a.id_user]);
  }
}

export interface Account {
  id_user: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  createdAt: Date;
  lastUpdated?: Date;
  status: number; // 1 = active, 0 = inactive
}
