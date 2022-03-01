export const circuitData: Circuit = {
  qubits: [
    {
      name: 'One'
    },
    {
      name: 'Two'
    },
    {
      name: 'Three'
    },
    {
      name: 'Four'
    },
    {
      name: 'Five'
    }
  ],
  bits: [
    {
      name: 'Alpha',
      size: 1
    },
    {
      name: 'Beta',
      size: 1
    },
    {
      name: 'Charlie',
      size: 1
    }
  ],
  ops: [
    {
      qubit: 3,
      step: 0,

      type: 'h',
      controlBits: [
        {
          index: 0,
          invert: true,
          value: 0
        }
      ],
      controlQubits: [2]
    },
    {
      qubit: 1,
      step: 1,

      type: 'x',
      controlBits: [
        {
          index: 1,
          value: 1,
          invert: false
        }
      ],
      controlQubits: [2]
    },
    {
      qubit: 1,
      step: 2,

      type: 'z',
      controlBits: [
        {
          index: 2,
          invert: true,
          value: 0
        }
      ],
      controlQubits: [0]
    },
    {
      qubit: 0,
      step: 3,

      type: 'h',
      controlBits: [],
      controlQubits: [1]
    },
    {
      qubit: 3,
      step: 3,

      type: 'h',
      controlBits: [],
      controlQubits: [4]
    },
    {
      qubit: 1,
      step: 4,

      type: 'barrier',
      span: 3
    },
    {
      qubit: 1,
      step: 5,

      type: 'reset',
      controlBits: [
        {
          index: 0,
          invert: false,
          value: 0
        },
        {
          index: 1,
          invert: false,
          value: 0
        },
        {
          index: 2,
          invert: false,
          value: 0
        }
      ]
    }
  ]
}
