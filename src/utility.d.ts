type NumberRange = {
  lower: number
  upper: number
}

type OperationLocation = {
  step: NumberRange
  qubit: NumberRange
}

type LocationInfo = {
  laneType: 'head' | 'op'
  bitType: 'qubit' | 'bit'

  step: number
  index: number
}
