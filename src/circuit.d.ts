type Circuit = {
  qubits: QubitProperty[]
  bits: BitProperty[]
  ops: Operation[]
  customOperations: Record<string, CustomGateProperties>
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
  | Instructions
  | MeasureInstruction
  | Gates
  | ParameterizedGates
  | SwapGate
  | CustomGate

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

type Instructions = BaseInstruction<'reset'>

type MeasureInstruction = BaseInstruction<'measure'> & {
  assignBit: AssignBitProperty
}

type Gates = BaseGate<'x' | 'y' | 'z' | 'h' | 's' | 'sdg' | 'sx' | 'sxdg' | 'sy' | 'sydg'| '4x' | '4xdg' | '4y' | '4ydg' | 't' | 'tdg'>

type SwapGate = BaseGate<'swap'> & {
  targetQubit: number
}

type CustomGate = BaseInstruction<'custom'> & {
  template: string
}

type ParameterizedGates = BaseParameterizedGate<'u1' | 'u2' | 'u3' | 'rx' | 'ry' | 'rz'>

type CustomGateProperties =
  | MatrixCustomGateProperty
  | RotationCustomGateProperty
  | OperationsCustomGateProperty

type CustomGateProperty<T> = {
  type: T
}

type RotationCustomGateProperty = CustomGateProperty<'rotation'> & {
  theta: number
  phi: number
  phase: number
}

type MatrixCustomGateProperty = CustomGateProperty<'matrix'> & {
  qubitCount: number
  matrix: number[][]
}

type OperationsCustomGateProperty = CustomGateProperty<'operation'> & {
  qubitCount: number
  ops: Operation[]
}
