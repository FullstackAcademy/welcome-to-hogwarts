const Rx = require('rx')
    , firebase = require('./firebase') 
    , auth = firebase.auth()
    , db = firebase.database()

const user = Rx.Observable.create(obs =>
  auth.onAuthStateChanged(user => user
    ? obs.onNext(user)
    : auth.signInAnonymously()))

const home = user.map(user => db.ref('users').child(user.uid))
const Profile = model({
  name: 'Your name',
  familiarName: "Your familiar's name (if any)",
  dateOfBirth: 'Your birthday (if any)',
  dateOfFirstSpell: 'The date you cast your first spell, incantation, or enchantment',
})
const profile = Profile(home)

function model(fields) {
  const props = Object.keys(fields)
    .reduce(
      (props, field) => Object.assign({}, props, {
        [field]: {
          get() {
            let _ref = null
            const refRx = this.refRx.flatMapLatest(ref => {
              _ref = ref
              return values(ref.child(field))
            })
            return Object.defineProperties(Object.create(refRx), {
              question: { get() { return fields[field] } },
              ref: { get() { return _ref } }
            })
          },
          set(val) { this.refRx.first().subscribe(ref => ref.child(field).set(val)) },
        }
      }), {})
  return refRx => Object.defineProperties({refRx}, props)
}

function form(questions) {
  const props = Object.keys(questions)
    .reduce(
      (props, field) => Object.assign({}, props, {
        [field]: {
          get() {
            const ref = this.ref.child(field)
            return Object.defineProperties(Object.create(ref), {
              question: { get() { return questions[field] } }
            })
          },
          set(val) { this.ref.child(field).set(val) },
        }
      }), {})
  return ref => Object.defineProperties({ref}, props)
}

function reset() {
  auth.signOut()
}

const values = ref => Rx.Observable.create(obs => {
  const listener = ref.on('value', snap => obs.onNext(snap.val()))
  return () => ref.off('value', listener)
})

let _state = null
home.flatMapLatest(home => values(home))
  .subscribe(state => {
    console.log('old state:', _state)
    _state = state    
    console.log('new state:', _state)
  })

module.exports = {
  profile,
  user,
  reset,
  get state() { return _state },
}

window.Hat = module.exports