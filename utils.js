const crypto = require('crypto')
const fs = require('fs');

const extractDirInPath = _path => {
  let arr = _path.split('/')
  arr = arr.splice(0, arr.length - 1)
  return {
    arr,
    str: arr.join('/')
  }
}

const extractFileInPath = _path => {
  const arr = _path.split('/')
  const nameArr = arr[arr.length - 1].split('.')
  const name = nameArr.splice(0, nameArr.length - 1).join('.')
  const ext = nameArr[nameArr.length - 1]
  return {
    name,
    ext,
  }
}


module.exports = {
  extractDirInPath,
  extractFileInPath,
}