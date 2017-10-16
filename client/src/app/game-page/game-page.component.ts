import { Component, OnInit } from '@angular/core';
import { AddGameService } from '../services/add-game.service'
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service'
import { EditUserService } from '../services/edit-user.service'
import { GroupService } from '../services/group.service'
import { ActivityService} from '../services/activity.service'

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css']
})
export class GamePageComponent implements OnInit {
  game:Array<any> = []
  users:Array<any> = []
  groupsOfGame:Array<object> = []
  gameId:number
  corresponds:boolean= true
  platformsGame:string = ''
  showButton:boolean = true
  loggedUser:Object
  buttonNotClicked:boolean = true

  constructor(public add: AddGameService,
              public route:ActivatedRoute,
              public auth:AuthService,
              public edit: EditUserService,
              public group: GroupService,
              public act: ActivityService) { }

  ngOnInit() {
    this.auth.isLoggedIn()
          .subscribe(user =>{
            this.loggedUser = user
            this.route.params
              .subscribe((params) => this.gameId = Number(params['id']));
            this.getMainGame(this.gameId)
            this.getUsers(this.gameId)
            this.checkIfUserHasThisGame(this.gameId)
            this.getGroupsOfGame(this.gameId)
          })


  }

getMainGame(id){
  this.add.findInDb(id).subscribe(game =>{
          if(game !== null){
            this.add.turnPic([game])
            this.add.bigScreenshot(game.screenshots)
            this.game = game
            this.checkPlatforms(game)

          }else{
            this.add.findGame(id).subscribe(newGame=>{
                this.game = newGame[0]
                this.add.bigScreenshot(this.game['screenshots'])
                this.add.saveGame(newGame[0]).subscribe()
                this.checkPlatforms(newGame[0])
              })
          }
        })
}
getUsers(id){
  this.add.searchUser(id)
    .subscribe((users)=>{
      this.users = users
    })

}
setCurrent(elem, other){
    elem.classList.add('current')
    other.classList.remove('current')
    this.corresponds = !this.corresponds

}
checkPlatforms(game){
  let platforms
  if(game.release_dates){
   platforms = game.release_dates
 }
 else{
   platforms = game.platforms
 }
  if(platforms.length > 1){
    this.platformsGame = 'MULTIPLATFORM'
  }else{
    switch(platforms[0].platform){
      case 48:
      this.platformsGame = "PlayStation"
      break;
      case 49:
      this.platformsGame = "Xbox"
      break;
      case 6:
      this.platformsGame = "PC"
      break;
      case 41:
      this.platformsGame = "Nintendo"
      break;
    }
  }
}

checkIfUserHasThisGame(gameId){
  this.loggedUser['games'].forEach(game =>{
    if(game == gameId){
      this.showButton = false
    }
  })
}
addGameToUser(gameId){
  let totalGames = this.loggedUser['games']
  totalGames.push(gameId.toString())
  this.buttonNotClicked = false;
  this.edit.addGame(this.loggedUser['_id'], totalGames)
          .subscribe(user => {
            this.getUsers(this.gameId)
            // console.log(this.createObjforAct())
            this.act.addNewAct(this.createObjforAct())
                    .subscribe()
          })
}
getGroupsOfGame(id){
  this.group.getGroupsOfSameGame(id)
            .subscribe(groups =>{
              this.groupsOfGame = groups
            })
}

createObjforAct(){
  const newObj = {
    addedUser: this.game['_id'],
    text:this.game['name'],
    owner:this.loggedUser['_id'],
    image: this.game['cover'].url,
    kind: 'GAME'
  }
console.log(newObj)
  return newObj
}
}
