import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MotdepasseComponent } from './motdepasse/motdepasse.component';  

const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'motdepasse', component: MotdepasseComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
