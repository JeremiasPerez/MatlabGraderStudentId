
const csv=require("csvtojson");

let searchReportFile = (fileName) => {
  return new Promise((resolve, rejejct) => {
    let regExp = fileName.replace(/[\(\)\/\:]/g,'.') + '.*\.csv'
    chrome.downloads.search({limit: 1, orderBy: ['-startTime'], filenameRegex: regExp}).then((items) => {
      if (items.length > 0) resolve(items[0])
      else resolve(null)
    })
  })
}

let getReportFileData = (filename) => {
  return new Promise((resolve, reject) => {
    fetch('file://'+filename)
      .then((response) => response.text())
      .then((text) => {
        csv()
          .fromString(text)
          .then((csvRow)=>{
            resolve(csvRow.map((el) => {return {studentId: el["Learner ID"], solutionId: el["Solution ID"]}}))
          })
      })
  })
}

let getStudentData = async () => {
  let items = await chrome.storage.local.get("studentData")
  if (items == null) return null
  return items['studentData']
}

let removeFile = (fileId) => {
  chrome.downloads.removeFile(fileId)
}

let combineData = (taskData, studentData) => {
  return taskData.map((el) => {
    let student = studentData.find((s) => {return s.studentId == el.studentId})
    if (student != null) return {solutionId: el.solutionId, studentId: el.studentId, studentName: student.studentName}
    else return {}
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  searchReportFile(message.name).then((file) => {
    getReportFileData(file.filename).then((data) => {
      getStudentData().then((studentData) => {
        sendResponse({resp: combineData(data, studentData)})
        removeFile(file.id)
      })
    })
  })
  return true
})
