import { Component } from '@angular/core';
import { PostService } from '../services/post.service';
import { ModalController } from '@ionic/angular';
import { AddPostModalPage } from '../add-post-modal/add-post-modal.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  posts: any[] = [];  
  currentPage: number = 1;
  loading: boolean = false;
  isLoading: boolean = false;

  constructor(
    private postService: PostService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    console.log('Home Page');
    this.loadPosts(); 
    this.loadPosts();
    this.postService.postCreated.subscribe((newPost: any)=>{
      this.posts.unshift(newPost);
    })
  }

  loadPosts(event?: any) {
    console.log('Load Post');
    this.isLoading = true;
    
    if (this.loading) return;
    this.loading = true;
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.style.display = 'block';
    }

    this.postService.getPosts(this.currentPage, 10).then((data: any) => {
      console.log(data);  
      this.posts = [...this.posts, ...data];
      this.currentPage++;
      this.loading = false;
      if (loadingMessage) {
        loadingMessage.style.display = 'none';
      }
      if (event) {
        event.target.complete();
      }
    }).catch((error) => {
      console.log(error);
      this.loading = false;
      if (loadingMessage) {
        loadingMessage.style.display = 'none';
      }
    });
  }

  loadData(event: any) {
    const scrollTop = event.detail.scrollTop;
    const offsetHeight = event.target.scrollHeight;
    const clientHeight = event.target.clientHeight;

    if (scrollTop + clientHeight >= offsetHeight - 1) {
      this.loadPosts(event);
    }
  }

  async addPost() {
    console.log('Open Add Post Modal');
    const modal = await this.modalController.create({
      component: AddPostModalPage,
      componentProps: {}
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.post) {
        this.posts.unshift(result.data.post);  
      }
    });

    return await modal.present();
  }
}
