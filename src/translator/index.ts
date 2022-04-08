import {circuitData} from '../render/data'

const capitalize = (string: string) => {
  const [first, ...rest] = string
  return first.toUpperCase() + rest.join('')
}

const getQiskitLibGateName = (gate_name: string) => {
  if (gate_name === 'p') return 'Phase'
  if (['sx', 'rx', 'ry', 'rz'].includes(gate_name)) return gate_name.toUpperCase()
  return capitalize(gate_name)
}

const generateConditionPermutation = (
  condition: Array<0 | 1 | null>
): Array<Array<0 | 1 | null>> => {
  let permutation: Array<Array<0 | 1 | null>> = []
  condition.forEach((c, i) => {
    if (c == null) {
      if (i === 0) {
        permutation = [[0], [1]]
        return
      } // continue
      permutation = [...permutation.map((p) => p.concat(0)), ...permutation.map((p) => p.concat(1))]
    } else {
      if (i === 0) {
        permutation = [[c]]
        return
      } // continue
      permutation = [...permutation.map((p) => p.concat(c))]
    }
  })
  return permutation
}

const expandClassicalConditions = (
  gate_info: Operation[],
  bit_count: number
): Operation[] => gate_info
  .map((gate) => {
    if ('controlBits' in gate && gate.controlBits.length > 0) {
      const filled_condition = new Array(bit_count).fill(null)
        .map((_, i) => gate.controlBits.find((e) => e.index === i) || null)
        .map((e) => e && (e.invert ? 0 : 1))
      return generateConditionPermutation(filled_condition).map((new_condition) => ({
        ...gate,
        controlBits: new_condition.map((v, i) => ({
          index: i,
          invert: !Boolean(v),
          value: 1
        }))
      }))
    }
    return gate
  })
  .flat()

export const translateCircuit = () => {
  const {qubits, bits, ops, customOperations} = circuitData
  const qubit_count = qubits.length
  const bit_count = bits.length

  const sortedOps = ops.sort((a, b) => a.step === b.step ? a.qubit - b.qubit : a.step - b.step)

  const expanded_gate_info = expandClassicalConditions(sortedOps, bits.length)

  const custom_gate_string = Object.keys(customOperations).map((name) => {
    const op = customOperations[name]

    if (op.type === 'rotation') return `qc_${name} = Operator(U3Gate(${op.theta},${op.phi},${op.phase}))`

    if (op.type === 'matrix') return `qc_${name} = Operator(${JSON.stringify(op.matrix)})`

    return ''
  })
    .join('\n')

  const qiskit_string = expanded_gate_info.map((gate) => {
    // measure instruction
    if (gate.type === 'measure') return `qc.measure(${gate.qubit}, ${gate.assignBit.index})\n`

    if (gate.type === 'reset') return `qc.reset(${gate.qubit})\n`

    if (gate.type === 'barrier') return `qc.barrier(${Array(gate.qubitSpan).fill(null)
      .map((_, i) => i + gate.qubit)
      .join(', ')})\n`

    // condition string
    const condition_string = 'controlBits' in gate && gate.controlBits.length > 0 ?
      `.c_if(cr, ${parseInt(gate.controlBits.map((e) => +!e.invert).reverse()
        .join(''), 2)})` :
      ''

    // custom gate
    if (gate.type === 'custom') {
      const operation = customOperations[gate.template]
      const qubit_count = operation.type === 'matrix' ? operation.qubitCount : 1
      return `qc.unitary(qc_${gate.template}, [${Array(qubit_count).fill(null)
        .map((_, i) => i + gate.qubit)
        .join(', ')}], label='${gate.template}')\n`
    }

    if (!('controlQubits' in gate)) return
    const control_count = gate.controlQubits.length

    // parameterized gate
    if ('params' in gate && gate.params.length) {
      const formatted_params = gate.params.join(', ')

      if (control_count === 0)
        return `qc.${gate.type}(${formatted_params}, ${gate.qubit})${condition_string}\n`

      // controlled gate
      const registers = [...gate.controlQubits, gate.qubit]
      return `qc.append(${getQiskitLibGateName(
        gate.type
      )}Gate(${formatted_params}).control(${control_count}), [${registers.join(
        ', '
      )}])${condition_string}\n`
    }

    // swap gate
    if (gate.type === 'swap') {
      if (control_count === 0)
        return `qc.swap(${gate.qubit}, ${gate.targetQubit})${condition_string}\n`

      const registers = [...gate.controlQubits, gate.qubit, gate.targetQubit]
      return `qc.append(SwapGate().control(${
        control_count
      }), [${registers.join(', ')}])${condition_string}\n`
    }

    // normal gate
    if (control_count === 0)
      return `qc.${gate.type}(${gate.qubit})${condition_string}\n`

    // controlled gate
    const registers = [...gate.controlQubits, gate.qubit]
    return `qc.append(${getQiskitLibGateName(
      gate.type
    )}Gate().control(${control_count}), [${registers.join(', ')}])${condition_string}\n`
  }).join('')

  const full_string = `from numpy import pi, e as euler
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.circuit.library.standard_gates import SdgGate, TdgGate, SXGate, RXGate, RYGate, RZGate, U1Gate, U2Gate, U3Gate, SwapGate, XGate, YGate, ZGate, HGate, PhaseGate, SGate, TGate
from qiskit.quantum_info.operators import Operator
qr = QuantumRegister(${qubit_count})
cr = ClassicalRegister(${bit_count})
qc = QuantumCircuit(qr, cr)
${custom_gate_string}
${qiskit_string}`

  // console.log(full_string)

  return full_string
}

export const updateCodeOutput = () => {
  document.getElementById('output-qiskit-result')!.innerHTML = translateCircuit()
  // @ts-expect-error
  Prism.highlightElement(document.getElementById('output-qiskit-result'))
}

updateCodeOutput()

Object.assign(window, {
  updateCodeOutput
})
