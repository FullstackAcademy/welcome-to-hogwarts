const Rx = require('rx')
    , firebase = require('./firebase') 
    , auth = firebase.auth()
    , db = firebase.database()

const user = Rx.Observable.create(obs =>
  auth.onAuthStateChanged(user => user
    ? obs.onNext(user)
    : auth.signInAnonymously()))

const home = user.map(user => db.ref('users').child(user.uid))
const profile = home.map(user => Profile(user))

const Profile = form({
  name: 'Your name',
  familiarName: "Your familiar's name (if any)",
  dateOfBirth: 'Your birthday (if any)',
  dateOfFirstSpell: 'The date you cast your first spell, incantation, or enchantment',
})

// const Reference = Object.getPrototypeOf(db.ref())

// Object.defineProperties(Reference, {
//   values: {
//     get() { return values(this) }
//   },
// })

const values = ref => Rx.Observable.create(obs => {
  const listener = ref.on('value', snap => obs.onNext(snap.val()))
  return () => ref.off('value', listener)
})

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

module.exports = {profile}

home.flatMapLatest(home => values(home))
  .subscribe(state => console.log('State:', state))

profile.subscribe(hat => {
  window.hat = hat
  console.log('updated hat')
})
