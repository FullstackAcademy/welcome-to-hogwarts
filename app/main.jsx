'use strict'
import React from 'react'
import {Router, Route, IndexRedirect, browserHistory} from 'react-router'
import {render} from 'react-dom'

import Hat from '../hat'

import Jokes from './components/Jokes'
import Login from './components/Login'
import WhoAmI from './components/WhoAmI'

class Layout extends React.Component {
  componentDidMount() {
    this.unsubscribe = Hat.profile.subscribe(user => this.setState({user}))
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    if (!this.state) return null
    const {user} = this.state
        , {children} = this.props
    console.log(user)
    const jsx =
      <div>
        <h1>Welcome, {user.name}</h1>
        {children}
      </div>
    return jsx
  }
}

render (
  <Router history={browserHistory}>
    <Route path="/" component={Layout}>
    </Route>
  </Router>,
  document.getElementById('main')
)