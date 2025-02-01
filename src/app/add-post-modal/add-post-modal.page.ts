import { Component, OnInit } from '@angular/core'; 
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../services/post.service';
import { Storage } from '@ionic/storage-angular';
import { ModalController, ActionSheetController } from '@ionic/angular';

defineCustomElements(window);

@Component({
  selector: 'app-add-post-modal',
  templateUrl: './add-post-modal.page.html',
  styleUrls: ['./add-post-modal.page.scss'],
  standalone: false
})
export class AddPostModalPage implements OnInit {
  post_image: any;
  addPostForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private postService: PostService,
    private storage: Storage,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController
  ) { 
    this.addPostForm = this.formBuilder.group({
      description: new FormControl('', Validators.required),
      Image: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
  }

  async uploadPhoto() {
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

  async takePhoto() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100
    });
    this.post_image = capturedPhoto.dataUrl;
    this.addPostForm.patchValue({
      Image: this.post_image
    });
  }

  async selectImageFromGallery() {
    const galleryPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      quality: 100
    });
    this.post_image = galleryPhoto.dataUrl;
    this.addPostForm.patchValue({
      Image: this.post_image
    });
  }

  async addPost(post_data: any){
    console.log('Add Post');
    console.log(post_data);
    const user = await this.storage.get('user');
    const post_param = {
      post: {
        description: post_data.description,
        image: post_data.Image,
        user_id: user.id
      }
    }; 
    console.log(post_param, 'Post para enviar');
    this.postService.createPost(post_param).then(
      (data:any) => {
        console.log(data,'post creado');
        this.modalController.dismiss({ post: data });
      },
      (error) => {
        console.log(error,'error');
      }
    );
  }

  cancel() {
    this.modalController.dismiss();
  }
}
