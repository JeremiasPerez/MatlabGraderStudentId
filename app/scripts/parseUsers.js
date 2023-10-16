
const Alerts = require('./utils/Alerts')

class UserParser {
  constructor(){}

  loadUserData (){
    let users = document.querySelectorAll('#participants .cell.c1[id*="user-index-participants"] a')
    if (users == null || users.length == 0) return
    let userList = []
    for (const userEl of users){
      let name = userEl.innerText
      let m = userEl.href.match(/id\=(\d+)/)
      if (m == null || m.length < 2) continue
      let id = m[1]
      userList.push({studentId: id, studentName: name})
    }

    chrome.storage.local.set({"studentData": userList}).then(() => {
      Alerts.showToast(`User data successfully parsed. ${userList.length} users found`)
    })
  }

  injectButton (){
    let that = this
    let refPoint = document.querySelector('.enrolusersbutton ')
    if (refPoint == null) return
    let button = document.createElement('button')
    button.innerText = 'Parse users'
    button.addEventListener('click',() => {
      that.loadUserData()
    })
    button.style.marginRight = '20px !important'
    refPoint.before(button)
  }

  init(){
    this.injectButton()
  }
}

const userParser = new UserParser()
userParser.init()
