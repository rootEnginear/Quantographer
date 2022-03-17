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
      active: false,

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
      active: false,

      type: 'x',
      controlBits: [
        {
          index: 1,
          value: 1,
          invert: false
        }
      ],
      controlQubits: [2, 3]
    },
    {
      qubit: 1,
      step: 2,
      active: false,

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
      active: false,

      type: 'h',
      controlBits: [],
      controlQubits: [1]
    },
    {
      qubit: 3,
      step: 3,
      active: false,

      type: 'h',
      controlBits: [],
      controlQubits: [4]
    },
    {
      qubit: 1,
      step: 4,
      active: false,

      type: 'barrier',
      qubitSpan: 3
    },
    {
      qubit: 2,
      step: 6,
      active: false,

      type: 'reset',
      controlBits: [
        {
          index: 0,
          invert: false,
          value: 0
        },
        {
          index: 2,
          invert: false,
          value: 0
        }
      ]
    },
    {
      qubit: 1,
      step: 5,
      active: false,

      type: 'measure',
      controlBits: [],
      assignBit: {
        index: 1,
        bit: 1
      }
    },
    {
      qubit: 0,
      step: 7,
      active: false,

      type: 'sx',
      controlBits: [],
      controlQubits: [2]
    },
    {
      qubit: 1,
      step: 8,
      active: false,

      type: 'sdg',
      controlBits: [],
      controlQubits: [3]
    },
    {
      qubit: 2,
      step: 9,
      active: false,

      type: 'tdg',
      controlBits: [],
      controlQubits: [4]
    },
    {
      qubit: 1,
      step: 10,
      active: false,

      type: 'rx',
      controlBits: [],
      controlQubits: [4],
      params: {}
    },
    {
      qubit: 0,
      step: 11,
      active: false,

      type: 'swap',
      targetQubit: 1,
      controlBits: [
        {
          index: 0,
          value: 1,
          invert: false
        }
      ],
      controlQubits: [2, 3]
    }
  ]
}
