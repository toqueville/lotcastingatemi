import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Grid from 'material-ui/Grid'
import Hidden from 'material-ui/Hidden'
import Typography from 'material-ui/Typography'

import AbilityEditor from './editors/abilityEditor.jsx'
import ArmorEditor from './editors/armorEditor.jsx'
import AttributeEditor from './editors/attributeEditor.jsx'
import BasicsEditor from './editors/basicsEditor.jsx'
import HealthLevelEditor from './editors/healthLevelEditor.jsx'
import IntimacyEditor from './editors/intimacyEditor.jsx'
import LimitEditor from './editors/limitEditor.jsx'
import MotePoolEditor from './editors/motePoolEditor.jsx'
import SpecialtyEditor from './editors/specialtyEditor.jsx'
import SolarExaltEditor from './editors/solarExaltEditor.jsx'
import WeaponEditor from './editors/weaponEditor.jsx'
import WillpowerEditor from './editors/willpowerEditor.jsx'
import XpEditor from './editors/xpEditor.jsx'

import { updateCharacter } from '../../ducks/actions.js'
import { fullChar } from '../../utils/propTypes'

class CharacterEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      character: this.props.character,
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleRatingChange = this.handleRatingChange.bind(this)
    this.handleCheck = this.handleCheck.bind(this)
  }

  componentWillReceiveProps(newProps) {
    this.setState({ character: newProps.character })
  }

  handleChange(e) {
    let { name, value } = e.target
    if (name == 'armor_tags')
      value = value.split(',')

    this.setState({ character: { ...this.state.character, [name]: value }})
  }

  handleBlur(e) {
    const { name } = e.target
    const { character } = this.state

    if (character[name] == this.props.character[name])
      return

    this.props.updateChar(character.id, name, character[name])
  }

  handleRatingChange(e) {
    let { name, value } = e.target
    const { character } = this.state

    this.setState({ character: { ...character, [name]: value }})
    this.props.updateChar(character.id, name, value)
  }

  handleCheck(e) {
    const { name } = e.target
    const { character } = this.state
    const value = ! character[name]

    this.props.updateChar(character.id, name, value)
  }

  render() {
    /* Escape hatch */
    if (this.props.character == undefined)
      return <div>
        <Typography paragraph>This Character has not yet loaded.</Typography>
      </div>

    const { character } = this.state
    const { handleChange, handleBlur, handleRatingChange, handleCheck } = this

    return <div>
      <Hidden smUp>
        <div style={{ height: '2.5em', }}>&nbsp;</div>
      </Hidden>

      <Grid container spacing={ 24 }>
        <Grid item xs={ 12 } md={ character.type == 'Character' ? 12 : 6 }>
          <BasicsEditor character={ character }
            onChange={ handleChange } onBlur={ handleBlur }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        { character.type == 'SolarCharacter' &&
          <Grid item xs={ 12 } md={ 6 }>
            <SolarExaltEditor character={ character }
              onChange={ handleChange } onBlur={ handleBlur }
              onRatingChange={ handleRatingChange }
            />
          </Grid>
        }

        <Grid item xs={ 12 } md={ 6 } lg={ 3 }>
          <HealthLevelEditor character={ character }
            onChange={ handleChange } onBlur={ handleBlur }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        <Grid item xs={ 12 } md={ 6 } lg={ 3 }>
          <WillpowerEditor character={ character }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        <Grid item xs={ 12 } md={ 6 } lg={ 3 }>
          <XpEditor character={ character }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        <Grid item xs={ 12 } md={ 6 } lg={ 3 }>
          <MotePoolEditor character={ character }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        <Grid item xs={ 12 } md={ 6 } lg={ 3 }>
          <AttributeEditor character={ character }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        <Grid item xs={ 12 } md={ 6 } lg={ 4 }>
          <AbilityEditor character={ character }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        <Grid item xs={ 12 } md={ 6 } lg={ 5 }>
          <SpecialtyEditor character={ character }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        <Grid item xs={ 12 } md={ 6 }>
          <IntimacyEditor character={ character }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        { character.type != 'Character' &&
          <Grid item xs={ 12 } md={ 3 }>
            <LimitEditor character={ character }
              onChange={ handleChange } onBlur={ handleBlur }
              onRatingChange={ handleRatingChange }
            />
          </Grid>
        }

        <Grid item xs={ 12 } lg={ 3 }>
          <ArmorEditor character={ character }
            onChange={ handleChange } onBlur={ handleBlur }
            onCheck={ handleCheck }
            onRatingChange={ handleRatingChange }
          />
        </Grid>

        <Grid item xs={ 12 }>
          <WeaponEditor character={ character } />
        </Grid>
      </Grid>
    </div>
  }
}
CharacterEditor.propTypes = {
  character: PropTypes.shape(fullChar),
  updateChar: PropTypes.func,
}

function mapStateToProps(state, ownProps) {
  const character = state.entities.characters[ownProps.match.params.characterId]
  let weapons = []
  let merits = []

  if (character != undefined) {
    if (character.weapons != undefined) {
      weapons = character.weapons.map((id) => state.entities.weapons[id])
    }
    if (character.weapons != undefined) {
      merits = character.merits.map((id) => state.entities.merits[id])
    }
  }

  return {
    character,
    weapons,
    merits,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateChar: (id, trait, value) => {
      dispatch(updateCharacter(id, trait, value))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterEditor)