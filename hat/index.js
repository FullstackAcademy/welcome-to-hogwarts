const Rx = require('rx')
    , firebase = require('./firebase') 
    , auth = firebase.auth()
    , db = firebase.database()

//--//--// Utility functions //--//--//

// Returns the promise of the next Observable value.
Rx.Observable.prototype.then = function(ok, fail) {
  return new Promise((resolve, reject) => this.first().subscribe(resolve, reject))
              .then (ok, fail)
}

// values(ref: FirebaseRef) -> Observable<Values>
// The stream of values from a firebase ref.
const values = ref => Rx.Observable.create(obs => {
  console.log('values ref:', ref)
  const listener = ref.on('value', snap => obs.onNext(snap.val()))
  return () => ref.off('value', listener)
})

//--//--// Auth //--//--//

// Keep us logged in.
// user: Observable<FirebaseRef>
const user = Rx.Observable.create(obs =>
  auth.onAuthStateChanged(user => user
    ? obs.onNext(user)
    : auth.signInAnonymously()))

// Reset with a new form.
function reset() {
  auth.signOut()
}

//--//--// The Form //--//--//

// home is a ref to where we store the current user's form data.
// It's Observable because it changes when the user logs out.
//
// home: Observable<FirebaseRef>
const home = user.map(user => db.ref('users').child(user.uid))

// profile is a schema applied to the home ref.
//
// The schema 
const profile = model ({
  name: 'Your name',
  familiarName: "Your familiar's name (if any)",
  dateOfBirth: 'Your birthday (if any)',
  dateOfFirstSpell: 'The date you cast your first spell, incantation, or enchantment',
}) (home)


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

//--//--// Model metaprogramming magic //--//--//

function model(fields) {
  const props = Object.keys(fields)
    .reduce(
      (props, field) => Object.assign({}, props, {
        [field]: {
          get() {
            const baseRefRx = this.refRx
            const fieldRefRx = this.refRx.map(ref => ref.child(field))
            return Object.defineProperties(fieldRefRx.flatMapLatest(values), {
              question: { get() { return fields[field] } },
              ref: { get() { return fieldRefRx } },
              set: { value(val) { return fieldRefRx.then(ref => ref.set(val)) } },
            })
          },
          set(val) { this.refRx.then(ref => ref.child(field).set(val)) },
        }
      }), {})

  // Return a function that takes an Observable<FirebaseRef>
  // and returns a model.
  return refRx => {
    const stream = refRx.flatMapLatest(values)
    stream.refRx = refRx
    Object.defineProperties(stream, props)
    return stream
  }
}

// For debugging
global.__Hat = global.__Hat || module.exports