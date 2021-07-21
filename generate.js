const fs=require('fs')
const path=require('path')

let arr = fs.readFileSync('./app.js', 'utf8').split(/\r\n|\n|\r/gm);
console.log(arr)
