export default () => {
  const readFile = (filePath: string) => {
    // 输入文件路径，读取文件，返回string
    // 文件放在public目录下，所以路径是相对于public的路径
    let xhr = null
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest()
    }
    else {
      // eslint-disable-next-line
      xhr = new ActiveXObject('Microsoft.XMLHTTP')
    }
    const okStatus = document.location.protocol === 'file' ? 0 : 200
    xhr.open('GET', filePath, false)
    xhr.overrideMimeType('text/html;charset=utf-8')
    xhr.send(null)
    return xhr.status === okStatus ? xhr.responseText : null
  }
  return {
    readFile
  }
}
