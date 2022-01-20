type QuantumCircuit = {
  qubitCount: number
  bitCount: number
  step: TimeStep[]
}

type TimeStep = MaybeGate[]

type MaybeGate =
  | null
  | Gate

type Gate =
  | BasisGate
  | ControlGate
  | MeasureGate
  | BarrierGate

type BasisGate = {
  type: 'h' | 'x'
  control: number[]
}

type ControlGate = {
  type: 'c'
  for: number
}

type MeasureGate = {
  type: 'm'
  assign: number
}

type BarrierGate = {
  type: 'b'
}
