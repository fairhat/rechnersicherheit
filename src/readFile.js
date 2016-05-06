'use strict'

const fs = require('fs')
const file = fs.readFileSync('./a2_master.passwd', 'utf8')
const american = fs.readFileSync('./american', 'utf8').split('\n')


// dirty, dirty native prototype extension <3
Number.prototype.padLeft = function (n, str) {
    return Array(n - String(this).length + 1).join(str || '0') + this
}

const getInitialUsers = file.split('\n').map((line) => {
  const l = line.split(':')
  return ({
    // get the name of the user
    name: l[0],
    // 2b replaced with 2a because the nodejs/npm bcrypt library doesn't work with 2b,
    // and since our passwords are not >72 chars, it shouldn't make any difference (?)
    password: l[1] ? l[1].replace('$2b$', '$2a$') : false,
    uid: l[2],
    gid: l[3],
    _class: l[4],
    change: l[5],
    expire: l[6],
    gecos: l[7],
    home_dir: l[8],
    shell: l[9],
    text: '', // will be used for decrypted passsword
  })
}).filter(k => k.password && k.password !== '*') // filter users that do not have a password

module.exports =  {
  getUsers: getInitialUsers,
  getDictionary: american,
  getPINCodes: Array.apply(null, { length: 10000 }).map(Number.call, Number).map(n => n.padLeft(4))
}
