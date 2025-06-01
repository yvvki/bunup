---
layout: home

hero:
  name: 'Bunup'
  text: 'Fast-bundler for libraries built with Bun'
  tagline: 'bundles faster than you can say "bundle"'
  actions:
    - theme: brand
      text: Get Started
      link: /docs
    - theme: alt
      text: Contribute
      link: https://github.com/arshad-yaseen/bunup

features:
  - title: Speed of Bun
    icon: ⚡️
    details: |
      Lightning-fast builds powered by Bun's native bundler
  - title: Bytecode Generation
    icon: 🔥
    details: |
      Faster startups by compiling to Bun bytecode—perfect for CLIs.
  - title: Workspace Support
    icon: 📦
    details: |
      Build multiple packages in one config file and with a single command.
  - title: Bun Native
    icon:
      src: https://bun.sh/logo.svg
    details: |
      First-class bundling support for libraries built with Bun.
---

<script setup>
import WithinHero from "/components/WithinHero.vue";

</script>
