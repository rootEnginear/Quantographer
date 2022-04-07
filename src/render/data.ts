export const circuitData: Circuit = {
  qubits: [{name: '0'}, {name: '1'}, {name: '2'}],
  bits: [{
    name: '0',
    size: 1
  }, {
    name: '1',
    size: 1
  }, {
    name: '2',
    size: 1
  }],
  ops: [{
    type: 'x',
    step: 0,
    qubit: 2,
    active: false,
    controlBits: [{
      index: 0,
      invert: true,
      value: 1
    }, {
      index: 1,
      invert: false,
      value: 1
    }, {
      index: 2,
      invert: true,
      value: 1
    }],
    controlQubits: []
  }, {
    type: 'x',
    step: 0,
    qubit: 2,
    active: false,
    controlBits: [{
      index: 0,
      invert: true,
      value: 1
    }, {
      index: 1,
      invert: false,
      value: 1
    }, {
      index: 2,
      invert: false,
      value: 1
    }],
    controlQubits: []
  }, {
    type: 'h',
    step: 1,
    qubit: 0,
    active: false,
    controlBits: [],
    controlQubits: []
  }, {
    type: 'h',
    step: 1,
    qubit: 1,
    active: false,
    controlBits: [],
    controlQubits: []
  }, {
    type: 'h',
    step: 1,
    qubit: 2,
    active: false,
    controlBits: [],
    controlQubits: []
  }, {
    type: 'x',
    step: 2,
    qubit: 1,
    active: false,
    controlBits: [],
    controlQubits: [0, 2]
  }, {
    qubit: 0,
    step: 6,
    active: true,
    type: 'custom',
    template: 'user2'
  }, {
    type: 'z',
    step: 3,
    qubit: 1,
    active: false,
    controlBits: [{
      index: 0,
      invert: false,
      value: 1
    }, {
      index: 1,
      invert: false,
      value: 1
    }],
    controlQubits: [2]
  }, {
    qubit: 0,
    step: 3,
    active: false,
    type: 'custom',
    template: 'user1'
  }, {
    qubit: 0,
    step: 4,
    active: false,
    type: 'barrier',
    qubitSpan: 2
  }, {
    type: 'measure',
    step: 5,
    qubit: 0,
    active: false,
    controlBits: [],
    assignBit: {
      index: 0,
      bit: 0
    }
  }, {
    type: 'swap',
    step: 0,
    qubit: 0,
    active: false,
    controlBits: [],
    controlQubits: [],
    targetQubit: 1
  }, {
    type: 'y',
    step: 4,
    qubit: 2,
    active: false,
    controlBits: [],
    controlQubits: []
  }],
  customOperations: {
    user1: {
      type: 'rotation',
      phi: 0,
      phase: 3.141592653589793,
      theta: 1.5707963267948966
    },
    user2: {
      type: 'matrix',
      qubitCount: 3,
      matrix: [[1, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1]]
    }
  }
}

// export const circuitData: Circuit = {
//   qubits: [{name: '0'}, {name: '1'}, {name: '2'}],
//   bits: [
//     {
//       name: '0',
//       size: 1
//     },
//     {
//       name: '1',
//       size: 1
//     },
//     {
//       name: '2',
//       size: 1
//     }
//   ],
//   ops: [
//     {
//       qubit: 0,
//       step: 3,
//       active: false,
//       type: 'custom',
//       controlBits: [{
//         index: 0,
//         invert: true,
//         value: 0
//       }],
//       template: 'user2'
//     },
//     {
//       qubit: 1,
//       step: 4,
//       active: false,
//       type: 'custom',
//       controlBits: [{
//         index: 0,
//         invert: true,
//         value: 0
//       }],
//       template: 'user1'
//     },
//     {
//       qubit: 1,
//       step: 5,
//       active: false,
//       type: 'barrier',
//       qubitSpan: 2
//     },
//     {
//       type: 'h',
//       step: 1,
//       qubit: 1,
//       active: false,
//       controlBits: [],
//       controlQubits: []
//     },
//     {
//       type: 'x',
//       step: 0,
//       qubit: 2,
//       active: false,
//       controlBits: [{
//         index: 0,
//         invert: false,
//         value: 1
//       },
//       {
//         index: 1,
//         invert: true,
//         value: 1
//       }],
//       controlQubits: []
//     },
//     {
//       type: 'h',
//       step: 1,
//       qubit: 2,
//       active: false,
//       controlBits: [],
//       controlQubits: []
//     },
//     {
//       type: 'h',
//       step: 1,
//       qubit: 0,
//       active: false,
//       controlBits: [],
//       controlQubits: []
//     },
//     {
//       type: 'x',
//       step: 2,
//       qubit: 1,
//       active: false,
//       controlBits: [],
//       controlQubits: [0, 2]
//     },
//     {
//       type: 'measure',
//       step: 6,
//       qubit: 1,
//       active: false,
//       controlBits: [],
//       assignBit: {
//         index: 0,
//         bit: 0
//       }
//     },
//     {
//       type: 'z',
//       step: 4,
//       qubit: 0,
//       active: false,
//       controlBits: [],
//       controlQubits: []
//     },
//     {
//       type: 'x',
//       step: 5,
//       qubit: 0,
//       active: false,
//       controlBits: [],
//       controlQubits: []
//     }
//   ],
//   customOperations: {
//     user1: {
//       type: 'rotation',
//       phi: 0.1,
//       phase: 0.1,
//       theta: 0.1
//     },
//     user2: {
//       type: 'matrix',
//       qubitCount: 3,
//       matrix: []
//     }
//   }
// }
