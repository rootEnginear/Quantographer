<template>
  <div class="field">
    <label class="label">Gate Name</label>
    <div class="control">
      <input class="input" type="text" placeholder="anAwesomeGate" />
    </div>
    <p class="help">The name must be in lowercase or uppercase letters.</p>
  </div>
  <div class="field">
    <label class="label">Create from</label>
    <div class="control">
      <div class="select is-fullwidth">
        <select v-model="build_method">
          <option :value="0">Rotation</option>
          <option :value="1">Matrix</option>
          <option :value="2">Circuit/Gates</option>
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
        v-for="(_, i) in mat_data.value"
        :key="i"
        type="text"
        v-model.number="mat_data.value[i]"
        class="input is-small" />
    </div>
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
    <button class="button is-primary is-small">
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

const rot_theta = ref(0)
const rot_phi = ref(0)
const rot_lambda = ref(0)

const mat_qubits = ref(1)
const mat_data = reactive<{ value: number[] }>({
  value: [0, 0, 0, 0]
})

watch(mat_qubits, () => {
  if (!isNaN(+mat_qubits.value))
    mat_data.value = new Array(((2 ** (+mat_qubits.value)) ** 2)).fill(0) as number[]
})


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