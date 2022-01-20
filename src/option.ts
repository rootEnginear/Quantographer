export const renderOption = Object.seal(
  {
    gridSize: 60,

    gateSize: 32,

    cGateSize: 8,
    cxGateSize: 20,

    mArrowHeight: 12,
    mArrowWidth: 5,

    gateBorderWidth: 2,

    ketFont: '20px LMR',
    gateTypeFont: '20px LMR',

    qubitLineWidth: 2,

    bitLineWidth: 1,
    bitLineSpacing: 1.5,

    barrierLineDash: [12, 4],

    get halfGridSize() {
      return this.gridSize / 2
    },

    get halfGateSize() {
      return this.gateSize / 2
    }
  }
)
