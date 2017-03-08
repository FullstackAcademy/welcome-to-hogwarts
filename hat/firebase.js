// Initialize Firebase
var config = {
  apiKey: "AIzaSyA75-JMv00MBKry57C2aGDDXtLnR8OYYs8",
  authDomain: "sorting-hat-404b5.firebaseapp.com",
  databaseURL: "https://sorting-hat-404b5.firebaseio.com",
  storageBucket: "sorting-hat-404b5.appspot.com",
  messagingSenderId: "43657510863"
}

module.exports = require('firebase').initializeApp(config)