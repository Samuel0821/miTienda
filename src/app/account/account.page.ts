import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Storage } from '@ionic/storage-angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';

defineCustomElements(window);

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false
})
export class AccountPage implements OnInit {
  user_data: any = {
    name: '',
    email: '',
    image: '',
    followed_users: [],
    following_users: [],
    following_users_count: 0 // Inicializar el contador
  };
  isEditProfileModalOpen = false;
  editProfileForm: FormGroup;

  constructor(
    private userService: UserService,
    private storage: Storage,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
  ) {
    this.editProfileForm = this.formBuilder.group({
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      image: ['']
    });
  }

  async ngOnInit() {
    let user: any = await this.storage.get('user');
    console.log(user, "usuario");
    this.userService.getUser(user.id).then(
      (data: any) => {
        console.log(data);
        this.storage.set('user', data);
        this.user_data = data;
        // Asegurarse de que `following_users` esté definido antes de leer su longitud
        this.user_data.following_users = this.user_data.following_users || [];
        // Actualizar el contador de usuarios seguidos
        this.user_data.following_users_count = this.user_data.following_users.length;
      }
    ).catch(
      (error) => {
        console.log(error);
      });
  }

  async takePhoto() {
    console.log('takePhoto');
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100
    });
    console.log(capturedPhoto.dataUrl);
    this.user_data.image = capturedPhoto.dataUrl;
    this.update();
  }

  async selectImageFromGallery() {
    const galleryPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      quality: 100
    });
    console.log(galleryPhoto.dataUrl);
    this.user_data.image = galleryPhoto.dataUrl;
    this.update();
  }

  async presentImageOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar fuente',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'Galería',
          icon: 'images',
          handler: () => {
            this.selectImageFromGallery();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async update() {
    this.userService.updateUser(this.user_data).then(
      (data) => {
        console.log(data);
      }
    ).catch(
      (error) => {
        console.log(error);
      });
  }

  openEditProfileModal() {
    this.editProfileForm.patchValue({
      name: this.user_data.name,
      last_name: this.user_data.last_name
    });
    this.isEditProfileModalOpen = true;
  }

  closeEditProfileModal() {
    this.isEditProfileModalOpen = false;
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editProfileForm.patchValue({ image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar fuente',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.selectImageSource(CameraSource.Camera);
          }
        },
        {
          text: 'Archivo',
          icon: 'image',
          handler: () => {
            this.selectImageSource(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async selectImageSource(source: CameraSource) {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: source,
      quality: 100
    });
    this.editProfileForm.patchValue({ image: capturedPhoto.dataUrl });
  }

  saveProfile() {
    if (this.editProfileForm.valid) {
      this.user_data.name = this.editProfileForm.value.name;
      this.user_data.last_name = this.editProfileForm.value.last_name;
      if (this.editProfileForm.value.image) {
        this.user_data.image = this.editProfileForm.value.image;
      }
      this.update();
      this.closeEditProfileModal();
    }
  }
}
