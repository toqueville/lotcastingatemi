// @flow
type traitBasics = {
  id: number,
  character_id: number,
  name: string,
}

export type Charm = traitBasics & {
  charm_type: string,
  type: string,
  min_essence: number,
  style?: string,
  artifact_name?: string,
  ability: string,
  min_ability: string,
  cost: string,
  timing: string,
  duration: string,
  keywords: Array<string>,
  prereqs: string,
  body: string,
  ref: string,
  summary: string,
  categories: Array<string>,
}

export type Spell = traitBasics & {
  cost: string,
  circle: string,
  control: boolean,
  timing: string,
  duration: string,
  keywords: Array<string>,
  body: string,
  ref: string,
  categories: Array<string>,
}

export type fullWeapon = traitBasics & {
  weight: 'light' | 'medium' | 'heavy',
  is_artifact: boolean,
  tags: Array<string>,
  ability: string,
  attr: string,
  damage_attr: string,
}

export type fullMerit = {
  id: number,
  character_id: number,
  label: string,
  merit_name: string,
  merit_cat: string,
  rating: number,
  description: string,
  ref: string,
  supernatural: boolean,
  prereqs: string,
}
