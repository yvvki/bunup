import {performance} from 'node:perf_hooks';

import {build as bunupBuild} from 'bunup';
import {build as tsdownBuild} from 'tsdown';
import {build as unbuildBuild} from 'unbuild';

const ITERATIONS = 5;
const ENTRY_POINT = 'src/project/index.ts';

interface BenchmarkResult {
      name: string;
      format: string;
      dts: boolean;
      averageTime: number;
}

const bundlers = [
      {
            name: 'bunup',
            buildFn: (options: any) => bunupBuild(options, process.cwd()),
            options: (dts: boolean) => ({
                  entry: [ENTRY_POINT],
                  outDir: 'bunup-dist',
                  format: ['esm', 'cjs'],
                  dts,
                  clean: true,
                  // tree shaking is always enabled, so we don't need to pass treeshake: true
                  // https://bun.sh/blog/bun-bundler?utm_source=chatgpt.com#tree-shaking
            }),
      },
      {
            name: 'tsdown',
            buildFn: tsdownBuild,
            options: (dts: boolean) => ({
                  entry: [ENTRY_POINT],
                  outDir: 'tsdown-dist',
                  format: ['esm', 'cjs'],
                  dts,
                  treeshake: true,
                  clean: true,
            }),
      },
      {
            name: 'unbuild',
            buildFn: (options: any) =>
                  unbuildBuild(process.cwd(), false, options),
            options: (dts: boolean) => ({
                  entries: [ENTRY_POINT],
                  outDir: 'unbuild-dist',
                  format: ['esm', 'cjs'],
                  declaration: dts,
                  clean: true,
            }),
      },
];

async function runBenchmarks() {
      const results: BenchmarkResult[] = [];

      console.log('Performing warmup builds...');
      for (const bundler of bundlers) {
            for (const dts of [false, true]) {
                  const options = bundler.options(dts);
                  console.log(`Warming up ${bundler.name} (dts: ${dts})...`);
                  await bundler.buildFn(options);
            }
      }
      console.log('Warmup complete. Starting benchmark...\n');

      for (const dts of [false, true]) {
            for (const bundler of bundlers) {
                  const options = bundler.options(dts);
                  let totalTime = 0;

                  for (let i = 0; i < ITERATIONS; i++) {
                        const start = performance.now();
                        await bundler.buildFn(options);
                        totalTime += performance.now() - start;
                  }

                  const averageTime = totalTime / ITERATIONS;
                  results.push({
                        name: bundler.name,
                        format: 'esm, cjs',
                        dts,
                        averageTime,
                  });
            }
      }

      results.sort((a, b) => {
            if (a.dts !== b.dts) return a.dts ? 1 : -1;
            return a.averageTime - b.averageTime;
      });

      const header = [
            '| Bundler        | Format   | dts   | Build Time |',
            '| -------------- | -------- | ----- | ---------- |',
      ];

      const rows = results.map(result => {
            const timeStr = `${result.averageTime.toFixed(2)}ms`;
            return `| ${result.name.padEnd(14)} | ${result.format.padEnd(8)} | ${String(result.dts).padEnd(5)} | ${timeStr.padEnd(10)} |`;
      });

      const markdownTable = [...header, ...rows].join('\n');
      console.log('\nBenchmark Results:');
      console.log(markdownTable);
}

runBenchmarks().catch(error => {
      console.error('Benchmarking failed:', error);
});
