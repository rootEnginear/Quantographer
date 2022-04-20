<template>
  <div class="field">
    <label class="label">Export as</label>
    <div class="control">
      <div class="select is-fullwidth">
        <select v-model="selectedType">
          <option value="qasm">QASM2</option>
          <option value="png">PNG</option>
        </select>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <strong>Output:</strong>
    </div>
    <div v-if="selectedType === 'qasm'">
      <a class="button is-ghost is-small" @click="copyCode">
        <span>{{ copyText }}</span>
        <span class="icon is-small">
          <i class="fa-solid fa-copy"></i>
        </span>
      </a>
    </div>
  </div>

  <textarea class="textarea" rows="10" v-if="selectedType === 'qasm'"
    v-model="currentCode"></textarea>

  <div class="image_display" v-if="selectedType === 'png'">
    <img v-bind:src="currentImg">
  </div>

  <div class="space"></div>
  <div class="separator"></div>
  <div class="row">
    <div class="col"></div>
    <button class="button is-primary is-small">
      <span class="icon is-small">
        <i class="fa-solid fa-file-export"></i>
      </span>
      <span>
        Save Output
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const selectedType = ref("qasm")
const copyText = ref("Copy")

const currentCode = ref(`qreg = QuantumRegister(3)
creg = ClassicalRegister(3)
circuit = QuantumCircuit(qreg, creg)

circuit.h(qreg)
circuit.cz(0,2)
circuit.cz(0,1)
circuit.h(qreg)
circuit.x(qreg)
circuit.h(0)
circuit.ccx(2,1,0)
circuit.h(0)
circuit.x(qreg)
circuit.h(qreg)
circuit.h(qreg)
circuit.x(qreg)
circuit.h(0)
circuit.ccx(2,1,0)
circuit.h(0)
circuit.x(qreg)
circuit.h(qreg)
circuit.measure(qreg, creg)

circuit.draw(output='mpl')`)

const currentImg = ref('circuit.png')

const exportDialogCompile = () => {
  switch (selectedType.value) {
    case "qasm":
      fetch("https://quantum-backend-flask.herokuapp.com/qasm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // @ts-expect-error
          "code": window.translateCircuit()
        }),
      })
        .then(r => r.json())
        .then(r => {
          currentCode.value = r.code
        })
        .catch(
          () => currentCode.value = '// cannot convert given Qiskit code into QASM2'
        )
      break
    case "png":
      fetch("https://quantum-backend-flask.herokuapp.com/qiskit_draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // @ts-expect-error
          "code": window.translateCircuit()
        }),
      }).then(r => r.json()).then(r => {
        currentImg.value = r.pic
      })
      break
  }
}

watch(selectedType, () => {
  exportDialogCompile()
})

const copyCode = () => {
  navigator.clipboard.writeText(currentCode.value)
  copyText.value = "Copied!"
  setTimeout(() => {
    copyText.value = "Copy"
  }, 1000)
}

Object.assign(
  window,
  { exportDialogCompile }
)
</script>

<style scoped lang="scss">
.image_display {
  overflow: scroll hidden;
  height: 264px;

  border: #dbdbdb 1px solid;
  border-radius: 4px;

  &>img {
    height: 100%;
  }
}
</style>
