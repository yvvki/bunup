---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Bunup'
  text: 'Fast-bundler for libraries built with Bun'
  tagline: 'bundles faster than you can say "bundle"'
  actions:
    - theme: brand
      text: Get Started
      link: /documentation/
    - theme: alt
      text: Contribute
      link: https://github.com/arshad-yaseen/bunup

features:
  - title: Speed of Bun
    icon: ⚡️
    details: |
      Lightning-fast builds — up to <strong style="color:var(--vp-c-brand-1)">~50× faster than Tsup</strong> and powered by Bun's native bundler
  - title: Bytecode Generation
    icon: 🔥
    details: |
      Faster startups by compiling to Bun bytecode—perfect for CLIs.
  - title: Workspace Support
    icon: 📦
    details: |
      Build multiple packages in one config file and with a single command.
  - title: Bun Targeting
    icon: 🎯
    details: |
      Optimize for Bun runtime to leverage native features and performance.
---

<script setup>
import WithinHero from "/components/WithinHero.vue";

</script>

<WithinHero>
<div class="benchmark-table">
  <table>
    <thead>
      <tr>
        <th>Bundler</th>
        <th>Format</th>
        <th>Build Time</th>
        <th>Build Time (with dts)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>bunup</td>
        <td>esm, cjs</td>
        <td>3.52ms ⚡️</td>
        <td>20.84ms ⚡️</td>
      </tr>
      <tr>
        <td>tsdown</td>
        <td>esm, cjs</td>
        <td>5.81ms</td>
        <td>35.84ms</td>
      </tr>
      <tr>
        <td>unbuild</td>
        <td>esm, cjs</td>
        <td>42.47ms</td>
        <td>314.54ms</td>
      </tr>
      <tr>
        <td>tsup</td>
        <td>esm, cjs</td>
        <td>63.59ms</td>
        <td>943.61ms</td>
      </tr>
    </tbody>
  </table>
</div>
</WithinHero>

<style>
.benchmark-table {
  margin: 2rem 0;
}
.benchmark-table table {
  width: 100%;
  border-collapse: collapse;
}
.benchmark-table th, 
.benchmark-table td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid var(--vp-c-divider);
}
.benchmark-table thead {
  background-color: var(--vp-c-bg-soft);
}
.benchmark-table tbody tr:nth-child(1) {
  font-weight: bold;
}
</style>
