import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TableauComponent } from './components/tableau/tableau.component';
import { NotificationComponent } from './notification/notification.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { OffreDetailComponent } from './offre-detail/offre-detail.component';
import { OffreListComponent } from './offre-list/offre-list.component';

import { ReservationComponent } from './reservation/reservation.component';
<<<<<<< HEAD

=======
import { OffreFormComponent } from './offre-form/offre-form.component';
import { TableauReservationComponent } from './components/tableau-reservation/tableau-reservation.component';
>>>>>>> 1e51ad72053d5055825faea5f090b75a41a2a972

@NgModule({
  declarations: [
    AppComponent,
    
  
    
    
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
   
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }