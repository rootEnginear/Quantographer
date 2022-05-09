<template>
  <div class="field" style="margin-bottom:0">
    <label class="label">Execute on</label>
    <div class="row">
      <div class="col">
        <div class="control">
          <div class="select is-fullwidth">
            <select v-model="sys">
              <option v-for="s in all_sys" :key="s.name" :value="s.name"
                :disabled="qubit_count > (s?.qb || 0) && s.name !== 'ibmq_qasm_simulator'">
                {{ s.name }} ({{ s.qb || 0 }} qubit{{ (s.qb || 0) > 1 ? 's' : '' }}<span
                  v-if="s.name !== 'ibmq_qasm_simulator'">, {{ s.qv || 0 }} QV</span>)
              </option>
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
      <article class="message is-danger" style="height:100%">
        <div class="message-body" style="height:100%">
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
  <template v-if="overlay_status !== 'IDLE'">
    <div class="execute-master-loader">
      <template v-if="overlay_status === 'RESULT'">
        <div class="box">
          <h2>Recommended Configuration:</h2>
          <ul style="padding-left:2ch">
            <li>
              <strong style="margin:0;display:inline">IBMQ System:</strong>
              &nbsp;<code>{{ rec_sys }}</code>
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
              &nbsp;<code>None</code>
            </li>
          </ul>
          <div class="row">
            <button class="button is-primary is-fullwidth" @click="useConfig()">
              <span>Use this configuration</span>
            </button>
            <button class="button" @click="closeOverlay()">
              <span>Discard</span>
            </button>
          </div>
        </div>
      </template>
      <template v-else-if="overlay_status === 'ERROR'">
        <article class="message is-danger">
          <div class="message-header">
            <p>An error occured!</p>
          </div>
          <div class="message-body">
            <p style="margin-bottom:1rem">
              {{ overlay_status_text }}
            </p>
            <div class="row">
              <button class="button is-fullwidth is-danger" @click="retry_function()">
                <span class="icon is-small">
                  <i class="fas fa-arrow-rotate-right"></i>
                </span>
                <span>Retry</span>
              </button>
              <button class="button" @click="closeOverlay()">
                <span>Discard</span>
              </button>
            </div>
          </div>
        </article>
      </template>
      <template v-else>
        <div class="spinner" style="width:25%;margin:1rem 0">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
        <h1 style="text-align:center">{{ overlay_status_text }}</h1>
      </template>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const overlay_status = ref<'IDLE' | 'FETCHING' | 'ERROR' | 'RESULT'>('FETCHING')
const overlay_status_text = ref("Connecting to Backends...")

const transpile_result_status = ref<'IDLE' | 'FETCHING' | 'ERROR'>('FETCHING')
const transpile_result = ref("")

const all_sys = ref([
  { name: 'ibmq_qasm_simulator', qb: 32, qv: null },
])

const sys = ref("ibmq_qasm_simulator")
const otlv = ref("0")
const rtmt = ref("basic")
const lomt = ref("trivial")
const sdmt = ref("none")

const rec_sys = ref("ibmq_qasm_simulator")
const rec_otlv = ref("2")
const rec_rtmt = ref("stochastic")
const rec_lomt = ref("noise_adaptive")

const qubit_count = ref(0)

const retry_function = ref(() => {})

const fetchAvailableBackends = async () => {
  overlay_status.value = 'FETCHING'
  overlay_status_text.value = 'Connecting to Backends...'

  try {
    const resp = await fetch('https://quantum-backend-flask.herokuapp.com/get_backend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // @ts-expect-error
        api_key: window.getApiKey()
      })
    })
    const r = await resp.json()
    if ('error' in r) throw new Error(r.error)
    const backends = r.sort((b: any, a: any) => a.qb === b.qb ? (a.qv === b.qv ? b.name.localeCompare(a.name) : a.qv - b.qv) : a.qb - b.qb)
    all_sys.value = backends

    const available_backend = backends.find((backend: any) => backend.qb >= qubit_count.value)
    if (!available_backend) throw new Error("We get the backends but your circuit is too big for any backends.")
    sys.value = available_backend.name

    // automatic retranspile
    updateTranspileResult()

    overlay_status.value = 'IDLE'

  } catch (e: any) {
    overlay_status.value = 'ERROR'
    overlay_status_text.value = `Cannot get backends: ${e?.message || JSON.stringify(e)}`
    retry_function.value = fetchAvailableBackends
  }
}

const updateTranspileResult = async () => {
  transpile_result_status.value = 'FETCHING'
  try {
    const resp = await fetch('https://quantum-backend-flask.herokuapp.com/transpile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // @ts-expect-error
        code: window.translateCircuit(),
        // @ts-expect-error
        api_key: window.getApiKey(),
        system: sys.value,
        layout: lomt.value,
        routing: rtmt.value,
        scheduling: sdmt.value === 'none' ? null : sdmt.value,
        optlvl: +otlv.value
      })
    })
    const r = await resp.json()
    if ('error' in r) throw new Error(r.error)
    transpile_result.value = r.pic
    transpile_result_status.value = 'IDLE'
  } catch (e: any) {
    transpile_result.value = e?.message || JSON.stringify(e)
    transpile_result_status.value = 'ERROR'
  }
}

const getRecommendation = async () => {
  overlay_status.value = 'FETCHING'
  overlay_status_text.value = 'Getting Recommendation...'

  try {

    const resp = await fetch('https://quantum-backend-flask.herokuapp.com/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // @ts-expect-error
        code: window.translateCircuit(),
        // @ts-expect-error
        api_key: window.getApiKey()
      })
    })

    const res = await resp.json()
    if ('error' in res) throw new Error(res.error)

    // check if 2 float is equal
    const isFloatEqual = (a: number, b: number) => {
      const diff = Math.abs(a - b)
      return diff < 0.00001
    }
    // sort by least acc_error
    const least_acc_error = res.sort((a: any, b: any) => isFloatEqual(a.acc_err, b.acc_err) ? b.optlvl - a.optlvl : a.acc_err - b.acc_err)
    console.log(least_acc_error)

    rec_sys.value = least_acc_error[0].system
    rec_otlv.value = least_acc_error[0].optlvl + ""
    rec_rtmt.value = least_acc_error[0].routing
    rec_lomt.value = least_acc_error[0].layout

    overlay_status.value = 'RESULT'
  } catch (e: any) {
    overlay_status.value = 'ERROR'
    overlay_status_text.value = e?.message || JSON.stringify(e)
    retry_function.value = getRecommendation
  }
}

const useConfig = () => {
  sys.value = rec_sys.value
  otlv.value = rec_otlv.value
  rtmt.value = rec_rtmt.value
  lomt.value = rec_lomt.value

  updateTranspileResult()
  closeOverlay()
}

const closeOverlay = () => {
  overlay_status.value = 'IDLE'
}

const toTitleCase = (str: string) => str.split('_').map((w) => w[0].toUpperCase() + w.slice(1))
  .join(' ')

const initExecuteDialog = () => {
  overlay_status.value = 'FETCHING'
  overlay_status_text.value = "Connecting to Backends..."
  transpile_result_status.value = 'FETCHING'
  transpile_result.value = ""
  all_sys.value = [
    { name: 'ibmq_qasm_simulator', qb: 32, qv: null },
  ]
  sys.value = "ibmq_qasm_simulator"
  otlv.value = "0"
  rtmt.value = "basic"
  lomt.value = "trivial"
  sdmt.value = "none"
  retry_function.value = () => {}

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