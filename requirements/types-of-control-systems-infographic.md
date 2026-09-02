---
marp: true
size: 16:9
html: true
title: Types of Control Systems
style: |
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');

  * { box-sizing: border-box; }

  section {
    width: 1280px;
    height: 720px;
    padding: 46px 58px 42px;
    background:
      linear-gradient(rgba(20, 39, 54, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(20, 39, 54, 0.035) 1px, transparent 1px),
      #f5f2e9;
    background-size: 28px 28px;
    color: #173042;
    font-family: 'IBM Plex Sans', sans-serif;
  }

  h1 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 48px;
    line-height: 1;
    letter-spacing: 0;
    color: #102a3b;
  }

  .kicker {
    margin: 8px 0 28px;
    color: #58707c;
    font-size: 17px;
    font-weight: 500;
  }

  .primary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }

  .system-card {
    min-height: 245px;
    padding: 24px 26px 22px;
    border: 2px solid #173042;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 6px 6px 0 #173042;
  }

  .system-card.closed { border-color: #0a7c78; box-shadow: 6px 6px 0 #0a7c78; }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .number {
    display: inline-grid;
    width: 36px;
    height: 36px;
    place-items: center;
    border-radius: 50%;
    background: #ed6a45;
    color: #fff;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 700;
  }

  .closed .number { background: #0a7c78; }

  h2 {
    flex: 1;
    margin: 0 0 0 12px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 27px;
    letter-spacing: 0;
  }

  .badge {
    padding: 6px 10px;
    border-radius: 4px;
    background: #fee1d6;
    color: #983c22;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .closed .badge { background: #d5eeea; color: #075b58; }

  .diagram {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 54px;
    margin: 5px 0 12px;
    font-size: 14px;
    font-weight: 600;
  }

  .block {
    padding: 9px 13px;
    border: 1.5px solid #173042;
    border-radius: 4px;
    background: #fff;
  }

  .arrow { color: #ed6a45; font-size: 24px; font-weight: 700; }
  .closed .arrow { color: #0a7c78; }

  .feedback-diagram {
    position: relative;
    padding-bottom: 17px;
  }

  .feedback {
    position: absolute;
    right: 79px;
    bottom: 0;
    width: 235px;
    border-bottom: 2px solid #0a7c78;
    color: #0a7c78;
    font-size: 11px;
    text-align: center;
  }

  .feedback::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 18px;
    border-left: 2px solid #0a7c78;
  }

  .feedback::after {
    content: '<';
    position: absolute;
    left: -5px;
    bottom: -7px;
    font-size: 16px;
    font-weight: 700;
  }

  .definition {
    margin: 0 0 10px;
    color: #314d5c;
    font-size: 15px;
    line-height: 1.35;
  }

  .example {
    margin: 0;
    color: #173042;
    font-size: 13px;
    font-weight: 600;
  }

  .compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 24px;
    margin-top: 15px;
    padding-top: 13px;
    border-top: 1px solid #d3d7d5;
    font-size: 13px;
  }

  .compare span::before { content: '+ '; color: #0a7c78; font-weight: 800; }
  .compare span:nth-child(even)::before { content: '- '; color: #d14d2b; }

  .other-title {
    margin: 30px 0 13px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #173042;
    text-transform: uppercase;
  }

  .taxonomy {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 13px;
  }

  .taxonomy-item {
    min-height: 95px;
    padding: 14px 15px;
    border-left: 5px solid #efb13c;
    background: #fff;
  }

  .taxonomy-item:nth-child(2) { border-color: #ed6a45; }
  .taxonomy-item:nth-child(3) { border-color: #0a7c78; }
  .taxonomy-item:nth-child(4) { border-color: #406a8c; }

  .taxonomy-item strong {
    display: block;
    margin-bottom: 7px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
  }

  .taxonomy-item span {
    color: #58707c;
    font-size: 12px;
    line-height: 1.35;
  }

  .footer {
    position: absolute;
    right: 58px;
    bottom: 16px;
    color: #6d7e86;
    font-size: 10px;
    text-transform: uppercase;
  }
---

# Types of Control Systems

<p class="kicker">How systems regulate behavior, respond to change, and reach a desired output.</p>

<div class="primary-grid">
  <article class="system-card open">
    <div class="card-head">
      <span class="number">01</span>
      <h2>Open-Loop Control</h2>
      <span class="badge">No feedback</span>
    </div>
    <div class="diagram">
      <span class="block">Input</span><span class="arrow">&#8594;</span>
      <span class="block">Controller</span><span class="arrow">&#8594;</span>
      <span class="block">Process</span><span class="arrow">&#8594;</span>
      <span class="block">Output</span>
    </div>
    <p class="definition">The control action is independent of the actual output. Simple and fast, but unable to correct disturbances.</p>
    <p class="example">Examples: toaster timer, fixed-cycle traffic light, washing-machine timer</p>
    <div class="compare"><span>Low cost and simple</span><span>Lower accuracy</span><span>Easy to maintain</span><span>No disturbance correction</span></div>
  </article>

  <article class="system-card closed">
    <div class="card-head">
      <span class="number">02</span>
      <h2>Closed-Loop Control</h2>
      <span class="badge">Uses feedback</span>
    </div>
    <div class="diagram feedback-diagram">
      <span class="block">Setpoint</span><span class="arrow">&#8594;</span>
      <span class="block">Controller</span><span class="arrow">&#8594;</span>
      <span class="block">Process</span><span class="arrow">&#8594;</span>
      <span class="block">Output</span>
      <span class="feedback">sensor feedback</span>
    </div>
    <p class="definition">The output is measured and compared with the target. Error drives correction, improving accuracy and robustness.</p>
    <p class="example">Examples: thermostat, cruise control, motor speed control</p>
    <div class="compare"><span>Accurate and adaptive</span><span>More complex</span><span>Rejects disturbances</span><span>May become unstable</span></div>
  </article>
</div>

<div class="other-title">Other common ways to classify control systems</div>

<div class="taxonomy">
  <div class="taxonomy-item"><strong>Linear / Nonlinear</strong><span>Whether superposition applies across the operating range.</span></div>
  <div class="taxonomy-item"><strong>Continuous / Discrete</strong><span>Signals evolve continuously or at sampled time intervals.</span></div>
  <div class="taxonomy-item"><strong>SISO / MIMO</strong><span>Single or multiple system inputs and outputs.</span></div>
  <div class="taxonomy-item"><strong>Deterministic / Stochastic</strong><span>Behavior is predictable or includes random uncertainty.</span></div>
</div>

<div class="footer">Control engineering quick guide</div>