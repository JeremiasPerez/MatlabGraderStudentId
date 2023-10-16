
const Utils = require('./utils/Utils')

class MatlabGrader {
  constructor() {
    this.active = false
    this.reportDownloaded = false
  }

  parseReport (data) {
    for (const item of data){
      let el = document.querySelector(`[id*="${item.solutionId}"]`)
      if (el == null) continue
      let solIdEl = el.querySelector('.row div:nth-child(2) .solution_panel_text')
      if (solIdEl != null) solIdEl.innerText = item.studentName
    }
  }

  async downloadReport () {
    let downloadButton = document.querySelector('#downloadReport')
    if(downloadButton != null) downloadButton.click()
    let confirmButton = document.querySelector('.modal-dialog .modal-footer .btn_color_blue')
    if(confirmButton != null) confirmButton.click()
    let exTitleEl = document.querySelector('#problem_title')
    if (exTitleEl == null) return
    let exTitle = exTitleEl.value
    await Utils.sleep(2000)
    let response = await chrome.runtime.sendMessage({action: 'downloadReport', name: exTitle})
    this.parseReport(response.resp)
  }

  enableOption () {
    if (this.active) return
    this.active = true
    this.downloadReport()
  }

  disableOption () {
    if (!this.active) return
    this.active = false
  }

  init () {
    let that = this
    const config = { childList: true, subtree: true }

    const observer = new MutationObserver((mutationList) => {
      let el = document.querySelector('.solution_list')
      if(el == null) that.disableOption()
      else that.enableOption()
    })

    observer.observe(document, config)
  }

}

let mg = new MatlabGrader()
mg.init()
