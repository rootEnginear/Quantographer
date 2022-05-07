<template>
  <div class="field" style="margin-bottom:0">
    <label class="label">Execute on</label>
    <div class="row">
      <div class="col">
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="sys">
              <option value="manila">ibmq_manila (5 qubits, 32 QV)</option>
              <option value="bogota">ibmq_bogota (5 qubits, 32 QV)</option>
              <option value="santiago">ibmq_santiago (5 qubits, 32 QV)</option>
              <option value="quito">ibmq_quito (5 qubits, 16 QV)</option>
              <option value="belem">ibmq_belem (5 qubits, 16 QV)</option>
              <option value="lima">ibmq_lima (5 qubits, 8 QV)</option>
              <option value="armonk" :disabled="qubit_count > 1">ibmq_armonk (1 qubit, 1
                QV)</option>
              <option value="qasm_simulator">ibmq_qasm_simulator</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <button class="button is-fullwidth" @click="getRecommendation()">
          <span class="icon is-small">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </span>
          <span>Get Recommendation</span>
        </button>
      </div>
    </div>
  </div>
  <strong>This is your transpiler configurations:</strong>
  <div class="row">
    <div class="col">
      <div class="field">
        <label class="label">Optimization Level</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="otlv">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Routing Method</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="rtmt">
              <option value="basic">Basic</option>
              <option value="stochastic">Stochastic</option>
              <option value="lookahead">Lookahead</option>
              <option value="sabre">Sabre</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="field">
        <label class="label">Layout Method</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="lomt">
              <option value="trivial">Trivial</option>
              <option value="dense">Dense</option>
              <option value="noise_adaptive">Noise Adaptive</option>
              <option value="sabre">Sabre</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Schedule Method</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="sdmt">
              <option value="none">None</option>
              <option value="as_soon_as_possible">As soon as possible</option>
              <option value="as_late_as_possible">As late as possible</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div style="margin-top:1rem">
    <button class="button is-fullwidth" @click="updateTranspileResult()"
      :disabled="transpile_result_status !== 'IDLE'">
      <span class="icon is-small">
        <i class="fa-solid fa-rotate"></i>
      </span>
      <span>Update Transpilation Result</span>
    </button>
  </div>
  <strong>Transpilation Result:</strong>
  <div class="circuit-preview">
    <template v-if="transpile_result_status === 'FETCHING'">
      <div class="row" style="height:100%">
        <div class="spinner" style="width:10%;margin:1rem 0">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
        <h1 style="text-align:center">Transpiling...</h1>
      </div>
    </template>
    <template v-else-if="transpile_result_status === 'ERROR'">
      <article class="message is-danger">
        <div class="message-body">
          <h1>An error occured!</h1>
          <p>Error: {{ transpile_result }}</p>
        </div>
      </article>
    </template>
    <template v-else>
      <img :src="transpile_result">
    </template>
  </div>
  <div class="space"></div>
  <div class="separator"></div>
  <div class="row">
    <div class="col"></div>
    <button class="button is-primary is-small">
      <span class="icon is-small">
        <i class="fa-solid fa-play"></i>
      </span>
      <span>
        Execute
      </span>
    </button>
  </div>
  <template v-if="backend_status !== 'IDLE'">
    <div class="execute-master-loader">
      <template v-if="backend_status === 'RESULT'">
        <div class="box">
          <h2>Recommended Configuration:</h2>
          <ul style="padding-left:2ch">
            <li>
              <strong style="margin:0;display:inline">IBMQ System:</strong>
              &nbsp;<code>ibmq_{{ rec_sys }}</code>
            </li>
            <li>
              <strong style="margin:0;display:inline">Optimization Level:</strong>
              &nbsp;<code>{{ toTitleCase(rec_otlv) }}</code>
            </li>
            <li>
              <strong style="margin:0;display:inline">Routing Method:</strong>
              &nbsp;<code>{{ toTitleCase(rec_rtmt) }}</code>
            </li>
            <li>
              <strong style="margin:0;display:inline">Layout Method:</strong>
              &nbsp;<code>{{ toTitleCase(rec_lomt) }}</code>
            </li>
            <li>
              <strong style="margin:0;display:inline">Schedule Method:</strong>
              &nbsp;<code>{{ toTitleCase(rec_sdmt) }}</code>
            </li>
          </ul>
          <div class="row">
            <button class="button is-primary is-fullwidth" @click="useConfig()">
              <span>Use this configuration</span>
            </button>
            <button class="button" @click="closeRecommendation()">
              <span>Discard</span>
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="spinner" style="width:25%;margin:1rem 0">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
        <h1 style="text-align:center">{{ backend_status_text }}</h1>
      </template>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const backend_status = ref<'IDLE' | 'FETCHING' | 'ERROR' | 'RESULT'>('FETCHING')
const backend_status_text = ref("Connecting to Backends...")

const transpile_result_status = ref<'IDLE' | 'FETCHING' | 'ERROR'>('FETCHING')
const transpile_result = ref("")

const sys = ref("manila")
const otlv = ref("0")
const rtmt = ref("basic")
const lomt = ref("trivial")
const sdmt = ref("none")

const rec_sys = ref("manila")
const rec_otlv = ref("2")
const rec_rtmt = ref("stochastic")
const rec_lomt = ref("noise_adaptive")
const rec_sdmt = ref("none")

const qubit_count = ref(0)

const simulateBackend = () => new Promise<void>((res) => {
  setTimeout(() => {
    res()
  }, Math.floor(Math.random() * (2000 - 500 + 1)) + 500)
})

const fetchAvailableBackends = () => {
  backend_status.value = 'FETCHING'
  backend_status_text.value = 'Connecting to Backends...'
  simulateBackend().then(() => {
    // automatic retranspile
    updateTranspileResult()

    backend_status.value = 'IDLE'
  })
}

const updateTranspileResult = () => {
  transpile_result_status.value = 'FETCHING'
  fetch('https://quantum-backend-flask.herokuapp.com/transpile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // @ts-expect-error
      code: window.translateCircuit(),
      // TODO: Change this system to other systems
      system: sys.value,
      layout: lomt.value,
      routing: rtmt.value,
      scheduling: sdmt.value === 'none' ? null : sdmt.value,
      optlvl: +otlv.value
    })
  }).then((r) => r.json())
    .then((r) => {
      transpile_result.value = r.pic
      transpile_result_status.value = 'IDLE'
    }).catch(e => {
      transpile_result.value = e?.message || JSON.stringify(e)
      transpile_result_status.value = 'ERROR'
    })
}

const getRecommendation = async () => {
  backend_status.value = 'FETCHING'
  backend_status_text.value = 'Getting Recommendation...'
  await simulateBackend()
  backend_status_text.value = 'Brute forcing 1/6 systems...'
  await simulateBackend()
  backend_status_text.value = 'Brute forcing 2/6 systems...'
  await simulateBackend()
  backend_status_text.value = 'Brute forcing 3/6 systems...'
  await simulateBackend()
  backend_status_text.value = 'Brute forcing 4/6 systems...'
  await simulateBackend()
  backend_status_text.value = 'Brute forcing 5/6 systems...'
  await simulateBackend()
  backend_status_text.value = 'Brute forcing 6/6 systems...'
  await simulateBackend()
  simulateRecommend()
  backend_status.value = 'RESULT'
}

const simulateRecommend = () => {
  // random 0 - 3
  rec_sys.value = ["manila", "bogota", "santiago", "quito", "belem", "lima"][Math.floor(Math.random() * 6)]
  rec_otlv.value = "" + Math.floor(Math.random() * 4)
  rec_rtmt.value = ["stochastic", "basic"][Math.floor(Math.random() * 2)]
  rec_lomt.value = ["noise_adaptive", "trivial"][Math.floor(Math.random() * 2)]
}

const useConfig = () => {
  sys.value = rec_sys.value
  otlv.value = rec_otlv.value
  rtmt.value = rec_rtmt.value
  lomt.value = rec_lomt.value
  sdmt.value = rec_sdmt.value

  updateTranspileResult()
  closeRecommendation()
}

const closeRecommendation = () => {
  backend_status.value = 'IDLE'
}

const toTitleCase = (str: string) => str.split('_').map((w) => w[0].toUpperCase() + w.slice(1))
  .join(' ')

const initExecuteDialog = () => {
  backend_status.value = 'FETCHING'
  backend_status_text.value = "Connecting to Backends..."
  transpile_result_status.value = 'FETCHING'
  transpile_result.value = ""
  sys.value = "manila"
  otlv.value = "0"
  rtmt.value = "basic"
  lomt.value = "trivial"
  sdmt.value = "none"

  // @ts-expect-error
  qubit_count.value = window.getQubitCount()

  fetchAvailableBackends()
}

Object.assign(
  window,
  { initExecuteDialog }
)
</script>

<style scoped lang="scss">
.execute-master-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(1px);

  display: flex;
  // justify-content: center;
  align-items: center;
  flex-direction: column;

  z-index: 5;

  padding-top: 7rem;
}
</style>