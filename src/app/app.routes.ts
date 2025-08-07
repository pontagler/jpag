import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', loadChildren: () => import('./end-user/end-user.module').then(m => m.EndUserModule)},   
    {path: 'artistspace', loadChildren: () => import('./artistspace/artistspace.module').then(m => m.ArtistspaceModule)},
    {path: 'hosts', loadChildren: () => import('./hosts/hosts.module').then(m => m.HostsModule)},
];
