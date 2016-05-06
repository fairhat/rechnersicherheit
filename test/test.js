const assert = require('chai').assert
const fs = require('fs')
const solution = JSON.parse(fs.readFileSync('./losung.json', 'utf8'))
const american = fs.readFileSync('./american', 'utf8').split('\n')

describe('Rechnersicherheit', function() {
  describe('Ubung2', function () {
    it('4 Passwords should be PIN (0000-9999) Codes', function () {
      assert.equal(solution.filter(k => parseInt(k.text) <= 9999).length, 4)
    })

    it('Randals Password is correcthorsebatterystaple', function () {
      assert.equal(solution.filter(k => k.text === 'correcthorsebatterystaple').length, 1)
    })

    it('1 Password should be an ordinary english word', function () {
      assert.equal(solution.filter(k => american.indexOf(k.text) !== -1).length, 1)
    })
  })
})
