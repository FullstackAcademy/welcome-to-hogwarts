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

// watch = event: String -> ref: FirebaseRef -> Observable<Snapshot>

const watch = event => ref => Rx.Observable.create(obs => {
  const listener = ref.on(event, snap => obs.next(snap))
  return () => ref.off(event, listener)
})

// val(snap: Snapshot<V>) -> V
const val = snap => snap.val()

// values(ref: FirebaseRef) -> Observable<Values>
// The stream of values from a firebase ref.
const values = ref => watch('value')(ref).map(val)

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
// The schema maps fields to questions.
const profile = model ({
  // Strings
  name: Ask('Your name'),
  familiarName: Ask("Your familiar's name (if any)"),

  // These should be numbers, ms since the epoch.
  dateOfBirth: Ask('Your birthday (if any)'),
  dateOfFirstSpell: Ask('The date you cast your first spell, incantation, or enchantment'),

  howDidYouHearAboutUs: Ask('How did you hear about Hogwarts?'),
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

// Each question is a function that takes its field name and
// returns a property descriptor.
function Ask(question) {
  return field => ({
    get() {
      const baseRefRx = this.ref$
      const fieldRefRx = this.ref$.map(ref => ref.child(field))
      return Object.defineProperties(fieldRefRx.flatMapLatest(values), {
        question: { value: question },
        ref: { get() { return fieldRefRx } },
        set: { value(val) { return fieldRefRx.then(ref => ref.set(val)) } },
      })
    },
    set(val) { this.ref$.then(ref => ref.child(field).set(val)) },
  })
}

function model(fields) {
  const props = Object.keys(fields)
    .reduce(
      (props, field) => Object.assign({}, props, {
        [field]: fields[field](field)
      }), {
        allQuestions: {value: Object.keys(fields)}
      })

  // Return a function that takes an Observable<FirebaseRef>
  // and returns a model.
  return ref$ => {
    const stream = ref$.flatMapLatest(values)
    stream.ref$ = ref$
    Object.defineProperties(stream, props)
    return stream
  }
}

// For debugging
global.__Hat = global.__Hat || module.exports