'use strict' // STRICT MODE, BABY

const bcrypt = require('bcrypt') // NPM Package (!) NEEDS TO BE DOWNLOADED FIRST (`npm install bcrypt`)
const fs = require('fs') // FileSystem Package (NodeJS internal)
const file = fs.readFileSync('./a2_master.passwd', 'utf8') // read File a2_master.passwd
const american = fs.readFileSync('./american', 'utf8').split('\n') // read american word list (taken from OpenBSD /usr/share/dict/american )
const results = [] // Result array

const letters = 'abcdefghijklmnoprqstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!?.-#+*~()[]"§$%&/'.split('')

// dirty, dirty native prototype extension <3
Number.prototype.padLeft = function (n,str){
    return Array(n-String(this).length+1).join(str||'0')+this;
}

// get permutations for array
function permutator(inputArr) {
  let resultArr = [];

  function permute(arr, memo) {
    memo = memo || [];
    let cur;

    for (let i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        resultArr.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return resultArr;
  }

  return permute(inputArr);
}

// get users array from file ({ name: USERNAME, password: BCRYPT_HASH })
const initialUsers = file.split('\n').map(line => {
  const l = line.split(':')
  return ({
    // get the name of the user
    name: l[0],
    // 2b replaced with 2a because the nodejs/npm bcrypt library doesn't work with 2b,
    // and since our passwords are not >72 chars, it shouldn't make any difference (?)
    password: l[1] ? l[1].replace('$2b$', '$2a$') : false,
  })
}).filter(k => k.password && k.password !== '*') // filter users that do not have a password

let users = initialUsers

/**
* @name importAntiGravity
* @async
* @return { Promise }
*/
function importAntiGravity() {
  return new Promise((resolve) => {
    const rand = users.find(k => k.name === 'rand')
    const carol = users.find(k => k.name === 'carol')
    bcrypt.compare('correcthorsebatterystaple', rand.password, function (err, pass) {
      if (pass) {
        results.push({ name: rand.name, password: rand.password, text: 'correcthorsebatterystaple' })
        resolve(results)
      }
    })
  })
}

/**
* @name checkPINCodes
* @async
* @return { Promise }
*/
function checkPINCodes() {
  return new Promise((resolve, reject) => {
    // create Array [0000, ... , 9999]
    const iterations = Array.apply(null, { length: 10000 }).map(Number.call, Number).map(n => n.padLeft(4))

    // iterate over all PIN Codes
    iterations.forEach((pin, i) => {

      // check for every user we didn't find a password for ( yet ;-) )
      users.forEach((user, j) => {

        // compare passwords
        bcrypt.compare(pin, user.password, function (err, done) {
          // err happened :(
          if (err) {
            // to keep things sane, we ignore bcrypt comparing errors
          } else {
            // done = passwords equal (bool)
            if (done) {
              // add
              const _usr = Object.assign({ }, user, { text: pin })
              result.push(_usr)
            }
          }
          if (i === iterations.length - 1 && j === users.length - 1) {
            resolve(results) // we're done
          }
        })
      })
    })
  })
}

/**
* @name checkAmericanWords
* @async
* @return { Promise }
*/
function checkAmericanWords() {
  return new Promise((resolve, reject) => {
    users.forEach((user, i) => {
      american.forEach((word, j) => {
        bcrypt.compare(word, user.password, function (err, done) {
          if (done) {
            const _usr = Object.assign({ }, user, { text: word })
            result.push(_usr)
          }
          if (i === users.length - 1 && j === american.length - 1) {
            resolve(results) // we're done
          }
        })
      })
    })
  })
}

importAntiGravity().then((k) => console.log(k)).catch((e) => console.error(e))
