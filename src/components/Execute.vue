<template>
  <div class="field">
    <label class="label">Execute on</label>
    <div class="control">
      <div class="select is-fullwidth">
        <select>
          <option>ibmq_guadalupe (Recommended)</option>
        </select>
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
            <select id="input-otlv">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2" selected>2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Layout Method</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select id="input-lomt">
              <option value="trivial">Trivial</option>
              <option value="dense">Dense</option>
              <option value="noise_adaptive" selected>Noise Adaptive</option>
              <option value="sabre">Sabre</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Routing Method</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select id="input-rtmt">
              <option value="basic">Basic</option>
              <option value="stochastic" selected>Stochastic</option>
              <option value="lookahead">Lookahead</option>
              <option value="sabre">Sabre</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Schedule Method</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select id="input-sdmt">
              <option value="none" selected>None</option>
              <option value="as_soon_as_possible">As soon as possible</option>
              <option value="as_late_as_possible">As late as possible</option>
            </select>
          </div>
        </div>
      </div>
      <button class="button is-fullwidth" onclick="updateTranspileResult()">
        <span class="icon is-small">
          <i class="fa-solid fa-rotate"></i>
        </span>
        <span>Update Transpilation Result</span>
      </button>
    </div>
    <div class="col">
      <div id="waitForOptimal">
        <div class="spinner">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
        <p style="text-align:center">
          Finding the statistically-optimal configuration...
        </p>
      </div>
      <article class="message is-info" id="gotOptimal" style="display:none">
        <div class="message-body">
          <h2 style="text-align:center">Optimal configuration found</h2>
          <ul style="padding-left: 1.5rem;">
            <li>
              <strong style="display:inline">
                Optimization Level:</strong>&nbsp;
              <span id="oplv"></span>
            </li>
            <li>
              <strong style="display:inline">
                Layout Method:</strong>&nbsp;
              <span id="lomt"></span>
            </li>
            <li>
              <strong style="display:inline">
                Routing Method:</strong>&nbsp;
              <span id="rtmt"></span>
            </li>
            <li>
              <strong style="display:inline">
                Schedule Method:</strong>&nbsp;
              <span id="sdmt"></span>
            </li>
          </ul>
          <button class="button is-fullwidth" onclick="copyRecommendTranspile()">
            <span class="icon is-small">
              <i class="fa-solid fa-copy"></i>
            </span>
            <span>Copy configuration</span>
          </button>
        </div>
      </article>
    </div>
  </div>
  <strong>Transpilation Result:</strong>
  <div class="circuit-preview">
    <img id="transpiled_circuit_image" src="circuit.png">
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
</template>