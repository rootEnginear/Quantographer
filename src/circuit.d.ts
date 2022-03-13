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

type OperationTypes = Operation['type']

type OperationRegistry<T> = Record<OperationTypes, T>

type BaseOperation<T extends string> = {
  active: boolean
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
  qubitSpan: number
}

type ResetInstruction = BaseInstruction<'reset'>

type MeasureInstruction = BaseInstruction<'measure'> & {
  assignBit: AssignBitProperty
}

type Gates = BaseGate<'x' | 'z' | 'h' | 'sx' | 'sdg' | 'tdg'>

type SwapGate = BaseGate<'swap'> & {
  targetQubit: number
}

type ParameterizedGates = BaseParameterizedGate<'u' | 'rx'>
