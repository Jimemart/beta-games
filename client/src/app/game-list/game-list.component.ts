import { Component, OnInit } from '@angular/core';
import { GetListService } from '../services/get-list.service'
import { AuthService } from '../services/auth.service'
import { AddGameService } from '../services/add-game.service'

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit {
  games;
  nosearching = false
  myGames = [];
  constructor( public myService:GetListService,
               public auth:AuthService,
               public addService:AddGameService) { }

  ngOnInit() {
    this.myService.getList(this.auth.platList)
              .subscribe((games)=>{
                games.forEach(game =>{
                  if(game.cover){
                  game.cover.url = game.cover.url.split("t_thumb").join("t_thumb_2x")
                }
                })
                this.games = games
              })

  }

  findGameObj(id){
    let foundGame
    this.games.forEach(game =>{
      if(game.id == id){
        foundGame = game
      }
    })
    return foundGame
  }

  showme(elem,cover){
    let idOfGame = elem.getAttribute('data-value')
    let index = this.addService.gamesToAdd.indexOf(idOfGame)
    let indexToSave = this.addService.gamesToSave.indexOf(this.findGameObj(idOfGame))
    if(index>=0){
      this.addService.gamesToAdd.splice(index,1)
      this.addService.gamesToSave.splice(indexToSave, 1)
      elem.classList.remove('selected')
      cover.classList.add('back')
    }else{
      this.addService.gamesToAdd.push(idOfGame)
      this.addService.gamesToSave.push(this.findGameObj(idOfGame))
      elem.classList.add('selected')
      cover.classList.remove('back')
    }
    console.log(this.addService.gamesToSave)
    }


  sendGames(){
    this.auth.gamesList = this.addService.gamesToAdd
    this.auth.secondStep = true

    this.addService.gamesToSave.forEach(game => {
        this.addService.findInDb(game.id)
            .subscribe(found =>{
              if(found === null){
                this.addService.saveGame(game)
                  .subscribe()
              }
            })
    });
  }
  searchingGames(val){
    this.nosearching = val;

  }

}
