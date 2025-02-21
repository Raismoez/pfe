import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MotdepasseComponent } from './motdepasse/motdepasse.component';
import { LoginComponent } from './login/login.component'; 

@NgModule({
  declarations: [
    AppComponent,
    MotdepasseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
