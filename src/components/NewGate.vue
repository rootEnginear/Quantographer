<template>
  <div class="field">
    <label class="label">Gate Name</label>
    <div class="control">
      <input v-model="gate_name" class="input" type="text" placeholder="mygate" />
    </div>
    <p class="help">
      The name must be only in lowercase letters without any spaces.
    </p>
  </div>
  <div class="field">
    <label class="label">Create from</label>
    <div class="control">
      <div class="select is-fullwidth">
        <select v-model="build_method">
          <option :value="0">Rotation</option>
          <option :value="1">Matrix</option>
          <!-- <option :value="2">Circuit/Gates</option> -->
        </select>
      </div>
    </div>
  </div>
  <!-- ROTATION -->
  <section v-if="build_method === 0">
    <div class="row" style="align-items:flex-start">
      <div class="col">
        <div class="field">
          <label class="label">Theta (deg)</label>
          <div class="control">
            <div class="row">
              <div class="col"><input v-model.number="rot_theta"
                  class="slider is-fullwidth" type="range"
                  min="0"
                  max="360" /></div>
              <div>
                <input v-model.number="rot_theta" class="input" type="number"
                  min="0"
                  max="360" />
              </div>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">Phi (deg)</label>
          <div class="control">
            <div class="row">
              <div class="col"><input v-model.number="rot_phi" class="slider is-fullwidth"
                  type="range"
                  min="0"
                  max="360" /></div>
              <div>
                <input v-model.number="rot_phi" class="input" type="number"
                  min="0"
                  max="360" />
              </div>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">Global Phase (deg)</label>
          <div class="control">
            <div class="row">
              <div class="col"><input v-model.number="rot_lambda"
                  class="slider is-fullwidth" type="range"
                  min="0"
                  max="360" /></div>
              <div>
                <input v-model.number="rot_lambda" class="input" type="number"
                  min="0"
                  max="360" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Bloch
          :phi="rot_phi"
          :theta="rot_theta"
          :lambda="rot_lambda" />
      </div>
    </div>
  </section>
  <!-- MATRIX -->
  <section v-if="build_method === 1">
    <div class="field">
      <label class="label">Operator Size (qubits)</label>
      <div class="control">
        <input v-model="mat_qubits" class="input" type="number" placeholder="0" min="1"
          max="4" />
      </div>
    </div>
    <div class="matrix-viz"
      :style="{ gridTemplateColumns: `repeat(${2 ** +mat_qubits},1fr)` }">
      <input
        v-for="(a, i) in mat_data.value"
        :key="i"
        :data-debug="a"
        type="text"
        v-model="mat_data.value[i]"
        class="input is-small" />
    </div>
    <p style="font-size:0.8em">
      You can use <code>i</code> as an imaginary part of a complex number. For example:
      <code>3+2i</code>
    </p>
  </section>
  <!-- CIRCUIT/GATES -->
  <section v-if="build_method === 2">
    <p>You can create a custom gate from a part of the circuit by grouping them, then
      right click on the group and select "Convert to Custom Gate".</p>
  </section>
  <div class="space"></div>
  <!-- <div class="separator"></div> -->
  <div class="row">
    <div class="col"></div>
    <button class="button is-primary is-small" @click="addGate">
      <span class="icon is-small">
        <i class="fa-solid fa-plus"></i>
      </span>
      <span>Create</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Bloch from './Bloch.vue'

const build_method = ref(0)
const gate_name = ref('')

const rot_theta = ref(0)
const rot_phi = ref(0)
const rot_lambda = ref(0)

const mat_qubits = ref(1)
const mat_data = reactive<{ value: string[] }>({
  value: ['0', '0', '0', '0']
})

watch(mat_qubits, () => {
  if (!isNaN(+mat_qubits.value))
    mat_data.value = new Array(((2 ** (+mat_qubits.value)) ** 2)).fill('0') as string[]
})

// watch(mat_data, () => {
//   mat_data.value = mat_data.value.map(v => v.toLocaleLowerCase() || '0').map(v => /e|i/i.test(v) ? v : parseInt(v) + "")
// })

const addGate = () => {
  // TODO: validate gate name
  // check if gate_name contains only lowercase letters
  if (!gate_name.value || !gate_name.value.match(/^[a-z]+$/)) {
    // @ts-expect-error
    window.alertify.alert("Gate Name is Invalid!", "Gate name must be only in lowercase letters without any spaces.")
    return
  }

  try {

    switch (build_method.value) {
      case 0:
        // @ts-expect-error
        window.addCustomGate(gate_name.value, {
          type: 'rotation',
          theta: rot_theta.value * Math.PI / 180,
          phi: rot_phi.value * Math.PI / 180,
          phase: rot_lambda.value * Math.PI / 180,
        })
        break;
      case 1:
        // console.log(mat_qubits.value, mat_data.value)
        // @ts-expect-error
        window.addCustomGate(gate_name.value, {
          type: 'matrix',
          qubitCount: mat_qubits.value,
          matrix: mat_data.value
        })
        break;
    }
  } catch (e) {
    // @ts-expect-error
    window.alertify.alert("Gate Creation Failed!", e.message)
    return
  }
  // @ts-expect-error
  window.newGateDialogInstance.close()
}

const initNewGateDialog = () => {
  build_method.value = 0
  gate_name.value = ''

  rot_theta.value = 0
  rot_phi.value = 0
  rot_lambda.value = 0

  mat_qubits.value = 1
  mat_data.value = ['0', '0', '0', '0']
}

Object.assign(
  window,
  { initNewGateDialog }
)
</script>

<style scoped lang="scss">
.matrix-viz {
  display: grid;
  gap: 8px;

  position: relative;
  background: white;
  margin: 32px 16px;

  &::before,
  &::after {
    content: "";
    background: black;
    position: absolute;
    top: -16px;
    left: -16px;
    height: calc(100% + 32px);
    width: 16px;
    clip-path: polygon(100% 0,
        100% 4px,
        4px 4px,
        4px calc(100% - 4px),
        100% calc(100% - 4px),
        100% 100%,
        0 100%,
        0 0);
  }

  &::after {
    left: unset;
    right: -16px;
    clip-path: polygon(0 0,
        0 4px,
        calc(100% - 4px) 4px,
        calc(100% - 4px) calc(100% - 4px),
        0 calc(100% - 4px),
        0 100%,
        100% 100%,
        100% 0);
  }
}
</style>