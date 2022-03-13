type NumberRange = {
  lower: number
  upper: number
}

type OpLocation = {
  step: NumberRange
  qubit: NumberRange
}

type LocationInfo = {
  laneType: string
  bitType: string

  step: number
  index: number
}
