import React, { Component } from 'react';
import Hat from '../../hat'

export default class Profile extends Component {
  setField = evt => Hat.profile[evt.target.name] = evt.target.value

  componentDidMount() {
    console.log(Object.keys(Hat.profile))
    Hat.profile.subscribe(profile => this.setState({profile}))
  }

  // 1. Uncontrolled form: has an onChange but no value
  // 2. Controlled form: add a value listener. 
  //   TODO: Add more fields
  //     - an enum (how did you hear about Hogwarts)
  //     - a choose-all select (areas of interest)
  //     - 2-3 text areas (essay questions)  
  //     - 
  // specs should test that:
  //   - We have the right input fields
  //   - When we enter information, the Hat changes.
  // 3. Filters: Motivated by date handling for date of birth, date of first dateOfFirstSpell
  //   - Dates should become dates via chrono-node
  //   - Name can't be blank
  //   - Date of first spell can't be before date of birth
  // 4. Refactor: 
  
  render() {
    if (!this.state) return null
    const profile = this.state.profile || {}
        , {name,
           dateOfBirth,
           dateOfFirstSpell,} = profile    
    return <div>
             <input name="name" onChange={this.setField} value={name} />
             <input name="familiarName" onChange={this.setField} value={familiarName} />
             <input name="dateOfBirth" onChange={this.setField} value={dateOfBirth} />
             <input name="dateOfFirstSpell" onChange={this.setField} value={dateOfFirstSpell} />
           </div>
  }
}
