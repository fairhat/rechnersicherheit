'use strict' // STRICT MODE, BABY

const bcrypt = require('bcrypt') // NPM Package (!) NEEDS TO BE DOWNLOADED FIRST (`npm install bcrypt`)
const fs = require('fs') // FileSystem Package (NodeJS internal)
const readFile = require('./src/readFile.js')
let users = readFile.getUsers
const american = readFile.getDictionary
const iterations = readFile.getPINCodes
const result = [] // Result array
const Spinner = require('cli-spinner').Spinner;

const letters = 'abcdefghijklmnoprqstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890!?.-#+*~()[]"§$%&/'.split('')

/**
* @name importAntiGravity
* @async
* @return { Promise }
*/
function importAntiGravity(results) {
  results = results || []
  return new Promise((resolve) => {
    const rand = users.find(k => k.name === 'rand')
    bcrypt.compare('correcthorsebatterystaple', rand.password, function (err, pass) {
      if (pass) {
        results.push({ name: rand.name, password: rand.password, text: 'correcthorsebatterystaple' })
        // users = users.filter(k => k !== user) // remove user from users
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
function checkPINCodes(results) {
  results = results || []
  return new Promise((resolve, reject) => {
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
              console.log(`${_usr.gid} | ${_usr.name}: ${_usr.text}`)
              users = users.filter(k => k !== user) // remove user from users
              results.push(_usr)
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
function checkAmericanWords(results) {
  results = results || []
  return new Promise((resolve, reject) => {
    users.forEach((user, i) => {
      american.forEach((word, j) => {
        bcrypt.compare(word, user.password, function (err, done) {
          if (done) {
            const _usr = Object.assign({ }, user, { text: word })
            console.log(`${_usr.gid} | ${_usr.name}: ${_usr.text}`)
            users = users.filter(k  => k !== user)
            results.push(_usr)
          }
          if (i === users.length - 1 && j === american.length - 1) {
            resolve(results) // we're done
          }
        })
      })
    })
  })
}

if (process.argv[2] === 'start') {
  const spinner = new Spinner('das kann \'ne Weile dauern...')
  spinner.setSpinnerString('|/-\\')
  spinner.start()
  checkPINCodes(result).then((k) => {
    console.log('PINCodes fertig.')
    return k
  }).then(importAntiGravity).then((k) => {
    console.log('Randall Munroe gefunden')

  }).then(checkAmericanWords).then(() => {
    console.log('Fertig. Datei Speichern...')
    const fileName = '01234567ABCDEF'.split('').map((v, i, a) => i > 5 ? null : a[ Math.floor(Math.random() * 16) ]).join('') + '.json'
    fs.writeFile(fileName, JSON.stringify(results), 'utf8', function (err, done) {
      if (err) console.log(err)
      console.log(`Datei: ${fileName} hat die Lösung.`)
      spinner.stop()
    })
  })
}
