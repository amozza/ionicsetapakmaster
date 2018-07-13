import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, App, LoadingController } from 'ionic-angular';
import { Http,Headers,RequestOptions } from '@angular/http';
import { UserData } from '../../../providers/user-data';
import { NgForm } from '@angular/forms';
import { AlertService } from '../../../providers/util/alert.service';

/**
 * Generated class for the TransaksijasaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-transaksijasa',
  templateUrl: 'transaksijasa.html',
})
export class TransaksijasaPage {
  token: string;
  BASE_URL = 'http://setapakbogor.site/';
  userLoggedIn: any;
  loading:any;
  submitted = false;
  headers = new Headers({ 
    'Content-Type': 'application/json'});
  options = new RequestOptions({ headers: this.headers});
  user: {user_id?: string, nama?: string, email?: string, alamat?: string, nohp?: string, userphoto?:string} = {};
  
  transaction_id :any;
  dataTransaksi:any;
  dataJasa :any;          
  dataPemandu :any;
  idAlamatCategory :any;
  dataAlamatCategory :any;
  constructor(public navCtrl: NavController,
    public alertService: AlertService, 
    public navParams: NavParams,
    public http: Http,    
    public userData: UserData,
    public toastCtrl : ToastController,
    public app:App,
    public loadCtrl: LoadingController) {
      this.transaction_id = this.navParams.data.transactionId
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TransaksijasaPage');
  }

  
  ionViewWillEnter() { 
    this.loading = this.loadCtrl.create({
      content: 'Tunggu sebentar...'
      });
      this.loading.present()
      this.getReadyData().then((x) => {
        if (x) this.loading.dismiss();
    });      
  }

  getReadyData(){
    return new Promise((resolve) => {        
            this.getTransaksiJasa(this.transaction_id)
            //this.getAlamatCategory(this.idAlamatCategory);
            this.userData.getData().then((value)=>{
            this.user.nama = value.nama;
            this.user.email = value.email;
            this.user.nohp = value.no_hp;
            this.user.user_id = value.user_id
          });    
          this.userData.getToken().then((token) => {
            this.token = token;
          });
          //this.hitungTotalPrice();
          //this.getDataProduk(this.datahomestay.homestay_id);    
          resolve(true);
    });
  }

  getTransaksiJasa(transaction_id){
    this.http.get(this.userData.BASE_URL+"api/transaksiJasa/user/transaksibyid/"+transaction_id,this.options).subscribe(data => {
      let response = data.json();
      if(response.status==200) {
        this.dataTransaksi = response.data
        //console.log(this.dataTransaksi)
        this.getDataJasa(this.dataTransaksi.jasa_id)        
      }
   }, err => { 
      this.showError(err);
   });
    
  }

  getDataJasa(idJasa){    
    this.http.get(this.userData.BASE_URL+"api/jasa/"+idJasa,this.options).subscribe(data => {
      let response = data.json();
      if(response.status==200) {       
         this.dataJasa = response.dataJasa
         this.dataAlamatCategory = response.dataAlamatCategory        
         this.dataPemandu = response.dataPemandu
         console.log(response)        
      }
   }, err => { 
      this.showError(err);
   });
  }
  uploadBuktiPembayaran(){

  }
 
  konfirmasiTransaksi(transaction_id){
    this.loading = this.loadCtrl.create({
      content: 'Tunggu sebentar...'
    });   
    this.alertService.presentAlertWithCallback('Konfirmasi Transaksi Selesai',
        'Anda yakin transaksi sudah selesai?').then((yes) => {
          if (yes) {
            this.loading.present();
            let input = JSON.stringify({      
              token: this.token
            }); 
            this.http.post(this.userData.BASE_URL+"api/transaksiJasa/user/konfirmasi/"+transaction_id,input,this.options).subscribe(data => {
              this.loading.dismiss();
              let response = data.json();       
              if(response.status == 200) {
                this.navCtrl.popToRoot()
                this.showAlert(response.message); 
              }else{
                this.showAlert(response.message); 
              }
            }, err => { 
                this.loading.dismiss();
                this.showError(err);
            });                                        
          }
        });           
  }

  cancelTransaksi(transaction_status,transaction_id){
    if(transaction_status > 0){
      this.showAlert("Transaksi telah berjalan atau telah diproses");
    }else{
      this.loading = this.loadCtrl.create({
        content: 'Tunggu sebentar...'
      });   
      this.alertService.presentAlertWithCallback('Cancel Transaksi',
        'Anda yakin ingin cancel transaksi ini?').then((yes) => {
            if (yes) {
              this.loading.present();
              let input = JSON.stringify({      
                token: this.token
              }); 
              this.http.post(this.userData.BASE_URL+"api/transaksiJasa/user/cancel/"+transaction_id,input,this.options).subscribe(data => {
                this.loading.dismiss();
                let response = data.json();       
                if(response.status == 200) {
                  this.navCtrl.popToRoot()
                  this.showAlert(response.message); 
                }else{
                  this.showAlert(response.message); 
                }
              }, err => { 
                  this.loading.dismiss();
                  this.showError(err);
              });                                        
            }
          });   
    }
  }
  showError(err: any){  
    err.status==0? 
    this.showAlert("Tidak ada koneksi. Cek kembali sambungan Internet perangkat Anda"):
    this.showAlert("Tidak dapat menyambungkan ke server. Mohon muat kembali halaman ini");
  }
  showAlert(message: string){
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}