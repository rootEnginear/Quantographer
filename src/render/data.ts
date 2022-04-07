export const circuitData: Circuit = {
  qubits: [
    {
      name: '0'
    },
    {
      name: '1'
    },
    {
      name: '2'
    }
    // {
    //   name: '3'
    // },
    // {
    //   name: '4'
    // }
  ],
  bits: [
    {
      name: '0',
      size: 1
    },
    {
      name: '1',
      size: 1
    },
    {
      name: '2',
      size: 1
    }
  ],
  ops: [
    {
      qubit: 0,
      step: 0,
      active: false,

      type: 'custom',
      controlBits: [
        {
          index: 0,
          invert: true,
          value: 0
        }
      ],
      template: 'user2'
    },
    {
      qubit: 1,
      step: 2,
      active: false,

      type: 'custom',
      controlBits: [
        {
          index: 0,
          invert: true,
          value: 0
        }
      ],
      template: 'user1'
    },
    {
      qubit: 1,
      step: 10,
      active: false,

      type: 'barrier',
      qubitSpan: 2
    }
  ],
  customOperations: {
    user1: {
      type: 'rotation',
      phi: 0.1,
      phase: 0.1,
      theta: 0.1
    },
    user2: {
      type: 'matrix',
      qubitCount: 3,
      matrix: []
    }
  }
}
