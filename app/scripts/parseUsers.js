
const Alerts = require('./utils/Alerts')

class UserParser {
  constructor(){}

  loadUserData (){
    let users = document.querySelectorAll('#participants .cell.c1[id*="user-index-participants"] a')
    if (users == null || users.length === 0) return
    let userList = []
    for (const userEl of users){
      let children = userEl.childNodes
      if (children.length !== 2 || userEl.lastChild.nodeType !== Node.TEXT_NODE) continue
      let name = userEl.lastChild.nodeValue
      let m = userEl.href.match(/id\=(\d+)/)
      if (m == null || m.length < 2) continue
      let id = m[1]
      userList.push({studentId: id, studentName: name})
    }

    chrome.storage.local.get('studentData').then((data) => {
      let list = data.studentData || []
      if(list.length === 0){
        list = userList
      } else {
        userList.forEach((u) => {
          let p = list.find((el) => u.studentId == el.studentId)
          if (p == null) list.push(u)
        })
      }
      chrome.storage.local.set({"studentData": list}).then(() => {
        Alerts.showToast(`User data successfully parsed. ${userList.length} users found`)
      })

    })
  }

  injectButton (){
    let that = this
    let refPoint = document.querySelector('p[data-region="participant-count"]')
    if (refPoint == null) return
    let button = document.createElement('button')
    button.innerText = 'Parse users'
    button.id = 'mgParseUsers'
    button.addEventListener('click',() => {
      that.loadUserData()
    })
    refPoint.before(button)
  }

  init(){
    this.injectButton()
  }
}

const userParser = new UserParser()
userParser.init()
