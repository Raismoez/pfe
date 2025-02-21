import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone:true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  

  constructor(private fb: FormBuilder,private route:Router) {
    
  }
mdp(){
this.route.navigateByUrl("motdepasse")
}
  onSubmit() {
   
  }
}