import {Component, effect, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {CommonModule} from "@angular/common";
import {User} from "../../models/user";
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import {CookiesService} from "../../services/cookies.service";
import {CommonService} from "../../services/common.service";

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {

  globalError = "";
  isLoggedIn = false;
  user = new User("", "", "", "", "", 0, false, "", "");
  displayName = "";
  cookieName = environment.cookieName;
  inscriptionUrl = environment.inscriptionUrl
  loginPopup = false;

  protected loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  authService = inject(AuthService);
  cookieService = inject(CookieService);
  commonService = inject(CommonService)

  selectedOnglet = this.commonService.selectedOnglet();


  constructor() {
    effect(()=> {
      this.selectedOnglet = this.commonService.selectedOnglet();
    })
  }

  ngOnInit(){
    let cookie = this.cookieService.get(this.cookieName)

    if (cookie){
      this.isLoggedIn = true;
      this.authService.identite().subscribe((data) => {
        let token = data.token ?? "";
        this.authService.token.set(token)
        this.authService.getUser(data.token).subscribe((userData) => {
          this.user = userData
          this.displayName = this.user.prenom && this.user.nom ? this.user.prenom + " " + this.user.nom : this.user.intitule;
          this.authService.setUserId(this.user.id_utilisateur)
          this.authService.setUser(this.user)
        })
      })
    }
  }

  onSubmit(){
    if(this.loginForm.valid){
      this.authService.login(this.loginForm.value.username, this.loginForm.value.password)
        .subscribe({
          next: (data: any) => {
            let token = data.token ?? "";
            this.authService.token.set(token)
            this.authService.getUser(token).subscribe((userData)=>{
              this.user = userData
              this.isLoggedIn = true
              this.displayName = this.user.prenom && this.user.nom ? this.user.prenom + " " + this.user.nom : this.user.intitule;
              this.authService.setUserId(this.user.id_utilisateur)
              this.authService.setUser(this.user)
              this.loginPopup = false;
            })
          },
          error: (err : any) => {
            this.globalError = err.error.error
          }
        });
    }
  }

  logout(){
    this.authService.logout().subscribe(()=>{
      if (this.selectedOnglet == "monactivite"){
        this.commonService.setOnglet("adeterminer")
      }
      this.authService.token.set("")
      this.authService.getUser("").subscribe((userData)=>{
        this.user = userData
        this.isLoggedIn = false
        this.displayName = "";
        this.authService.setUserId("")
        this.authService.setUser(null)
      })
    })
  }

  openLoginPopup(){
    this.loginPopup = true;
  }

  closeLoginPopup(){
    this.loginPopup = false;
  }
}
