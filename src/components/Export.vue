<template>
  <div class="field">
    <label class="label">Export as</label>
    <div class="control">
      <div class="select is-fullwidth">
        <select v-model="selectedType">
          <option value="qasm">QASM 2.0</option>
          <option value="qiskit">Qiskit (Python)</option>
          <option value="png">PNG</option>
        </select>
      </div>
    </div>
  </div>

  <template v-if="fetching === 'FETCHING'">
    <div class="spinner" style="width:27%">
      <div class="double-bounce1"></div>
      <div class="double-bounce2"></div>
    </div>
    <h1 style="text-align:center">Exporting...</h1>
  </template>
  <template v-else-if="fetching === 'ERROR'">
    <article class="message is-danger">
      <div class="message-body">
        <h1>An error occured!</h1>
        <p>Error: {{ result }}</p>
      </div>
    </article>
  </template>
  <template v-else>
    <div class="row">
      <div class="col">
        <strong>Output:</strong>
      </div>
      <div v-if="displayType === 'text'">
        <a class="button is-ghost is-small" @click="copyCode">
          <span>{{ copyText }}</span>
          <span class="icon is-small">
            <i class="fa-solid fa-copy"></i>
          </span>
        </a>
      </div>
    </div>

    <textarea class="textarea" rows="10" v-if="displayType === 'text'"
      v-model="result"></textarea>

    <div class="image_display" v-if="displayType === 'img'">
      <img v-bind:src="result">
    </div>
  </template>


  <div class="space"></div>
  <div class="separator"></div>
  <div class="row">
    <div class="col"></div>
    <button class="button is-primary is-small" @click="saveData"
      :disabled="fetching !== 'IDLE'">
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
import { ref, watch, computed } from 'vue'

type EXPORT_ABLE_TYPE = "qasm" | "qiskit" | "png"
const selectedType = ref<EXPORT_ABLE_TYPE>("qasm")
const copyText = ref("Copy")

const fetching = ref<'IDLE' | 'FETCHING' | 'ERROR'>('FETCHING')
const result = ref(``)

const fileType = computed(() => {
  return {
    "qasm": { ext: "qasm", mime: "text/plain" },
    "qiskit": { ext: "qiskit", mime: "text/plain" },
    "png": { ext: "png", mime: "image/png" }
  }[selectedType.value]
})
const displayType = computed(() => {
  return {
    "qasm": "text",
    "qiskit": "text",
    "png": "img"
  }[selectedType.value]
})

const exportDialogCompile = async () => {
  fetching.value = 'FETCHING'
  switch (selectedType.value) {
    case "qasm":
      try {
        const resp = await fetch("https://quantum-backend-flask.herokuapp.com/qasm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            // @ts-expect-error
            "code": window.translateCircuit()
          }),
        })
        const data = await resp.json()
        if (data.error) throw new Error(data.error)
        result.value = data.code
        fetching.value = 'IDLE'
      } catch (e) {
        result.value = (e as Error)?.message ?? "Some error happened"
        fetching.value = 'ERROR'
      }
      break
    case "png":
      try {
        const resp = await fetch("https://quantum-backend-flask.herokuapp.com/qiskit_draw", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            // @ts-expect-error
            "code": window.translateCircuit()
          }),
        })
        const data = await resp.json()
        result.value = data.pic
        fetching.value = 'IDLE'
      } catch (e) {
        result.value = (e as Error)?.message ?? "Some error happened"
        fetching.value = 'ERROR'
      }
      break
    case "qiskit":
      // @ts-expect-error
      result.value = window.translateCircuit()
      fetching.value = 'IDLE'
      break;
  }
}

watch(selectedType, () => {
  exportDialogCompile()
})

const copyCode = () => {
  navigator.clipboard.writeText(result.value)
  copyText.value = "Copied!"
  setTimeout(() => {
    copyText.value = "Copy"
  }, 1000)
}

const initExportDialog = (choice: EXPORT_ABLE_TYPE) => {
  selectedType.value = choice || "qasm"
  copyText.value = 'Copy'
  fetching.value = 'FETCHING'
  result.value = ``

  exportDialogCompile()
}

Object.assign(
  window,
  { initExportDialog }
)

const saveData = () => {
  let urlData = null

  if (displayType.value === 'img') {
    urlData = result.value
  } else {
    const blobData = new Blob(
      [result.value],
      { type: fileType.value.mime }
    )

    urlData = URL.createObjectURL(blobData)
  }

  // console.log("🚀 ~ file: Export.vue ~ line 174 ~ saveData ~ urlData", urlData)
  const linkElement = document.createElement('a')

  linkElement.href = urlData
  // @ts-expect-error
  linkElement.download = `${window.getFileName()}.${fileType.value.ext}`

  linkElement.click()

  if (displayType.value !== 'img') {
    URL.revokeObjectURL(urlData)
  }
}
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
