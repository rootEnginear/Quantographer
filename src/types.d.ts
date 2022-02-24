type Circuit = {
  qubits: QubitProperty[]
  bits: BitProperty[]
  ops: Operation[]
}

type QubitProperty = {
  name: string
}

type BitProperty = {
  name: string
  size: number
}

type ControlBitProperty = {
  index: number
  value: number
  invert: boolean
}

type AssignBitProperty = {
  index: number
  bit: number
}

type Operation =
  | BarrierDirective
  | ResetInstruction
  | MeasureInstruction
  | Gates
  | ParameterizedGates
  | SwapGate

type BaseOperation<T extends string> = {
  qubit: number
  step: number
  type: T
}

type BaseInstruction<T extends string> = BaseOperation<T> & {
  controlBits: ControlBitProperty[]
}

type BaseGate<T extends string> = BaseInstruction<T> & {
  controlQubits: number[]
}

type BaseParameterizedGate<T extends string> = BaseGate<T> & {
  params: {}
}

type BarrierDirective = BaseOperation<'barrier'> & {
  span: number
}

type ResetInstruction = BaseInstruction<'reset'>

type MeasureInstruction = BaseInstruction<'measure'> & {
  assignBit: AssignBitProperty | undefined
}

type Gates = BaseGate<'x' | 'z' | 'h'>

type SwapGate = BaseGate<'swap'> & {
  targetQubit: number
}

type ParameterizedGates = BaseParameterizedGate<'u' | 'rx'>
