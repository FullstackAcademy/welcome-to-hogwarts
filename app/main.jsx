'use strict'
import React from 'react'
import {Router, Route, IndexRedirect, browserHistory} from 'react-router'
import {render} from 'react-dom'

import Hat from '../hat'

import Profile from './components/Profile'
import Login from './components/Login'
import WhoAmI from './components/WhoAmI'

class Layout extends React.Component {
  componentDidMount() {
    this.unsubscribe = Hat.profile.name.subscribe(name => this.setState({name}))
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    if (!this.state) return null
    const name = this.state.name
        , {children} = this.props
    return <div>
             <h1>Welcome, {name}</h1>
             {children}
           </div>
  }
}

render (
  <Router history={browserHistory}>
    <Route path="/" component={Layout}>
      <IndexRedirect to="/profile" />
      <Route path="/profile" component={Profile} />
    </Route>
  </Router>,
  document.getElementById('main')
)