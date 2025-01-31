import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.page.html',
  styleUrls: ['./search-users.page.scss'],
  standalone: false
})
export class SearchUsersPage implements OnInit {
  users: any[] = [];
  page: number = 1;
  limit: number = 10;
  query: string = '';
  hasMoreUsers: boolean = true;

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadUsers();
  }
  
  loadUsers(event?: any) {
    this.userService.listUsers(this.page, this.limit, this.query).then(
      (data: any) => {
        if (data.users && data.users.length > 0) {
          this.users = [...this.users, ...data.users];
          this.page++;
        } else {
          this.hasMoreUsers = false;
        }
        if (event) {
          event.target.complete();
        }
      }
    ).catch(
      (error) => {
        console.log(error);
        if (event && event.target) {
          event.target.complete();
        }
      }
    );
  }

  searchUser(event: any) {
    this.query = event.target.value || '';
    this.page = 1;
    this.users = [];
    this.hasMoreUsers = true;
    this.loadUsers();
  }
  follow(user_id: any){
    console.log('follow',user_id);
  }
}
