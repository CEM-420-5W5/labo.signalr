import { Component, OnInit } from '@angular/core';
import * as signalR from "@microsoft/signalr"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  title = 'labo.signalr.ng';
  private hubConnection?: signalR.HubConnection;
  usercount = 0;
  tasks: UselessTask[] = [];
  taskname: string = "";

  ngOnInit(): void {
    this.connecttohub()
  }

  connecttohub() {
    // TODO On doit commencer par créer la connexion vers le Hub
    this.hubConnection = new signalR.HubConnectionBuilder()
                              .withUrl('https://localhost:7289/tasks')
                              .build();
    // TODO On se connecte au Hub  
    this.hubConnection
      .start()
      .then(() => {
        console.log('La connexion est live!');
        // TODO Une fois connectée, on peut commencer à écouter pour les évènements qui vont déclencher des callbacks
        this.hubConnection!.on('UserCount', (data) => {
          this.usercount = data;
        });

        this.hubConnection!.on('TaskList', (data) => {
          console.log(data);
          this.tasks = data;
        });

        //this.hubConnection!.invoke('ConnectNewUser')
      })
      .catch(err => console.log('Error while starting connection: ' + err))
  }

  complete(id: number) {
    this.hubConnection!.invoke('CompleteTask', id);
  }

  addtask() {
    // TODO On appel la fonction JoinChatRoom du Hub 
    this.hubConnection!.invoke('AddTask', this.taskname);
  }

}


export class UselessTask {
  constructor(
    public id: number,
    public text: string,
    public completed: boolean
  ) { }
}
