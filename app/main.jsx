'use strict'
import React from 'react'
import {Router, Route, IndexRedirect, browserHistory} from 'react-router'
import {render} from 'react-dom'

import Hat from '../hat'
import Jokes from './components/Jokes'
import Login from './components/Login'
import WhoAmI from './components/WhoAmI'

const ExampleApp =
  ({ user, children }) =>
    <div>
      <nav>
        {user ? <WhoAmI/> : <Login/>}
      </nav> 
      {children}
    </div>

render (
  <Router history={browserHistory}>
    <Route path="/" component={ExampleApp}>
      <IndexRedirect to="/jokes" />
      <Route path="/jokes" component={Jokes} />
    </Route>
  </Router>,
  document.getElementById('main')
)