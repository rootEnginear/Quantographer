const circuit: QuantumCircuit = {
  qubitCount: 6,
  bitCount: 2,
  step: [
    [
      {
        type: 'h',
        control: []
      },
      {
        type: 'x',
        control: []
      }
    ],
    [
      {
        type: 'c',
        for: 1
      },
      {
        type: 'x',
        control: [0]
      },
      {
        type: 'h',
        control: []
      },
      {
        type: 'h',
        control: []
      }
    ],
    [
      {
        type: 'c',
        for: 5
      },
      {
        type: 'c',
        for: 5
      },
      {
        type: 'c',
        for: 5
      },
      {
        type: 'c',
        for: 5
      },
      {
        type: 'c',
        for: 5
      },
      {
        type: 'x',
        control: [0, 1, 2, 3, 4]
      }
    ],
    [
      {
        type: 'b'
      },
      {
        type: 'b'
      }
    ],
    [
      {
        type: 'm',
        assign: 0
      }
    ],
    [
      null,
      {
        type: 'm',
        assign: 1
      }
    ]
  ]
}

export default circuit
