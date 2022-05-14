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
    <label style="display:flex;align-items:center">
      <strong>Shots:</strong>&nbsp;
      <input class="input is-small" type="number" min="1" v-model.number="shots"
        style="width:10ch">
    </label>
    <button class="button is-primary is-small" @click="executeCircuit()"
      :disabled="overlay_status !== 'IDLE'">
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
      <template v-else-if="overlay_status === 'EXEC_RESULT'">
        <div class="box" style="margin: 0 16px">
          <div class="row">
            <h2 class="col">Results:</h2>
            <button class="button is-ghost is-small"
              @click="switchResult('EXEC_RESULT_CHART')">
              <span>See Chart</span>
            </button>
          </div>
          <div class="result-overflow-box">
            <ul class="result-list">
              <li v-for="el in JSON.parse(overlay_status_text)" :key="el[0]">
                <code><strong style="margin:0;display:inline">{{ el[0] }}:</strong></code>
                {{ el[1] }}
              </li>
            </ul>
          </div>
          <div class="row">
            <button class="button is-primary" @click="closeOverlay()">
              <span>Close</span>
            </button>
            <button class="button" @click="copyExecuteResult()">
              <span>{{ copyText }}</span>
            </button>
          </div>
        </div>
      </template>
      <template v-else-if="overlay_status === 'EXEC_RESULT_CHART'">
        <div class="box" style="margin: 0 16px;width:calc(100% - 32px)">
          <div class="row">
            <h2 class="col">Results:</h2>
            <button class="button is-ghost is-small" @click="switchResult('EXEC_RESULT')">
              <span>See Data</span>
            </button>
          </div>

          <div class="result-overflow-box no-over">
            <table
              class="charts-css column hide-data show-labels show-primary-axis show-4-secondary-axes show-data-axes">
              <caption>Execution Result</caption>
              <thead>
                <tr>
                  <th scope="col">Result</th>
                  <th scope="col">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="el in JSON.parse(overlay_status_text)" :key="el[0]">
                  <th>{{ el[0] }}</th>
                  <td :style="calcChart(el[1])">
                    <span class="data">{{ el[1] }}</span>
                    <span class="tooltip">{{ el[1] }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="row">
            <button class="button is-primary" @click="closeOverlay()">
              <span>Close</span>
            </button>
            <button class="button" @click="copyExecuteResult()">
              <span>{{ copyText }}</span>
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
import { ref, StyleValue } from 'vue'
import { getApiKey, isCircuitHasMeasure, getQubitCount } from '../render'
import { Store } from '../store';
import { translateCircuit } from '../translator';

const overlay_status = ref<'IDLE' | 'FETCHING' | 'ERROR' | 'RESULT' | 'EXEC_RESULT' | 'EXEC_RESULT_CHART'>('FETCHING')
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
const shots = ref(1024)

const rec_sys = ref("ibmq_qasm_simulator")
const rec_otlv = ref("2")
const rec_rtmt = ref("stochastic")
const rec_lomt = ref("noise_adaptive")

const qubit_count = ref(0)

const retry_function = ref(() => {})
const copyText = ref("Copy Result")

const fetchAvailableBackends = async () => {
  overlay_status.value = 'FETCHING'
  overlay_status_text.value = 'Connecting to Backends...'

  try {
    const resp = await fetch('https://quantum-backend-flask.herokuapp.com/available_backend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: getApiKey()
      })
    })
    const r = await resp.json()
    if ('error' in r) throw new Error(r.error)
    const backends = r.result.sort((b: any, a: any) => a.qb === b.qb ? (a.qv === b.qv ? b.name.localeCompare(a.name) : a.qv - b.qv) : a.qb - b.qb)
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
        code: translateCircuit(),
        key: getApiKey(),
        system: sys.value,
        layout: lomt.value,
        routing: rtmt.value,
        scheduling: sdmt.value === 'none' ? null : sdmt.value,
        level: +otlv.value
      })
    })
    const r = await resp.json()
    if ('error' in r) throw new Error(r.error)
    transpile_result.value = r.result
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
        code: translateCircuit(),
        key: getApiKey()
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
    const least_acc_error = res.result.sort((a: any, b: any) => isFloatEqual(a.acc_err, b.acc_err) ? b.level - a.level : a.acc_err - b.acc_err)
    // console.log(least_acc_error)
    if (least_acc_error.length === 0) throw new Error('no result')

    rec_sys.value = least_acc_error[0].system
    rec_otlv.value = least_acc_error[0].level + ""
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

const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

const executeCircuit = async () => {
  if (!isCircuitHasMeasure()) {
    alertify.alert("No measurement found!", 'You need to have at least one measurement in your circuit.')
    return;
  }

  document.getElementById("execute-circuit-dialog")?.parentElement?.scrollTo(0, 0)

  overlay_status.value = 'FETCHING'
  overlay_status_text.value = 'Sending circuit information...'

  const ws = new WebSocket('wss://quantum-backend-flask.herokuapp.com/run')

  try {
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true })
      ws.addEventListener('error', rej, { once: true })
    })

    ws.send(JSON.stringify({
      code: translateCircuit(),
      key: getApiKey(),
      system: sys.value,
      layout: lomt.value,
      routing: rtmt.value,
      scheduling: sdmt.value === 'none' ? null : sdmt.value,
      level: +otlv.value,
      shots: +shots.value
    }))

    await new Promise<void>((res, rej) => {
      ws.addEventListener('error', rej, { once: true })
      ws.addEventListener('close', rej, { once: true })
      ws.addEventListener('message', (e) => {
        // console.log(e.data)
        const r = JSON.parse(e.data)
        switch (r.status) {
          case 'INITIALIZING':
            // console.log('INITIALIZING', r)
            overlay_status_text.value = pickRandom([
              `IBMQ is initializing.`,
              `IBMQ is initializing..`,
              `IBMQ is initializing...`,
            ])
            break;
          case 'QUEUED':
            // console.log('QUEUED', r)
            const {
              queue,
              est_time // -> "12:34:56.7890"
            } = r

            if (!queue) {
              overlay_status_text.value = `Your circuit is queued.`;
              break;
            }

            if (!est_time) {
              overlay_status_text.value = `Your circuit is queued, ${queue}.`;
              break;
            }

            let time_label = ['h', 'm', 's']
            let time_split = est_time.split(".")[0].split(":"); // ["12","34","56"]
            if (time_split[0] === '0') {
              time_label = time_label.splice(1)
              time_split = time_split.splice(1)
            }
            const time_string = time_split.map((t: string, i: number) => t + time_label[i]).join(':')
            overlay_status_text.value = `Your circuit is queued, ${r.queue} left. (~${time_string})`

            break;
          case 'VALIDATING':
            // console.log('VALIDATING', r)
            overlay_status_text.value = pickRandom([
              `IBMQ is validating your circuit.`,
              `IBMQ is validating your circuit..`,
              `IBMQ is validating your circuit...`
            ])
            break;
          case 'DONE':
            // console.log('DONE', r)
            overlay_status.value = 'EXEC_RESULT'
            overlay_status_text.value = JSON.stringify(r.value)
            res()
            break;
          case 'ERROR':
          case 'CANCELLED':
            // console.log('ERROR/CANCELLED', r)
            rej(`${r.error}`)
            break;
          default:
            // console.log('DEFAULT', r)
            overlay_status_text.value = pickRandom([
              `Your circuit is running right now.`,
              `Your circuit is running right now..`,
              `Your circuit is running right now...`,
            ])
        }
      })
    })
  } catch (e: any) {
    // console.log('CATCH!', e)
    overlay_status.value = 'ERROR'
    overlay_status_text.value = e?.message || JSON.stringify(e)
    retry_function.value = executeCircuit
  } finally {
    // console.log('FINALLY!')
    ws.close()
  }
}

const copyExecuteResult = () => {
  // console.log(overlay_status_text.value)
  navigator.clipboard.writeText(overlay_status_text.value)
  copyText.value = "Copied!"
  setTimeout(() => {
    copyText.value = "Copy Result"
  }, 1000)
}

const calcChart = (value: number) => {
  return {
    '--size': value / shots.value,
  } as StyleValue
}

const switchResult = (scene: 'EXEC_RESULT' | 'EXEC_RESULT_CHART') => {
  overlay_status.value = scene
}

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
  shots.value = 1024
  copyText.value = "Copy Result"
  retry_function.value = () => {}

  qubit_count.value = getQubitCount()

  fetchAvailableBackends()
}

Store.initExecuteDialog = initExecuteDialog
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

.result-overflow-box {
  height: 200px;
  overflow-y: scroll;
  border: #dbdbdb 1px solid;
  padding: 16px;
  border-radius: 8px;
  margin: 8px 0;

  &.no-over {
    overflow: hidden;
  }

  &>.result-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    list-style: none;
    margin: 0;
  }
}
</style>
