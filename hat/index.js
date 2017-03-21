const Rx = require('rx')
    , firebase = require('./firebase') 
    , auth = firebase.auth()
    , db = firebase.database()

const values = ref => Rx.Observable.create(obs => {
  const listener = ref.on('value', snap => obs.onNext(snap.val()))
  return () => ref.off('value', listener)
})

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
  return refRx => {
    const stream = refRx.flatMapLatest(values)
    stream.refRx = refRx
    Object.defineProperties(stream, props)
    return stream
  }
}

function reset() {
  auth.signOut()
}

let _state = null
home.flatMapLatest(values)
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

// For debugging
global.__Hat = global.__Hat || module.exports