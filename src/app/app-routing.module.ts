import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MotdepasseComponent } from './motdepasse/motdepasse.component';  
import { profilAComponent } from './profilA/profilA.component';
import { UserListComponent } from './user-list/user-list.component';
import { ProfilUComponent } from './profil-u/profil-u.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StockComponent } from './stock/stock.component';

const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'motdepasse', component: MotdepasseComponent },
  { path: 'profilA', component: profilAComponent },
  { path: 'list', component: UserListComponent },
  { path: 'profilU', component: ProfilUComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'stock', component: StockComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
