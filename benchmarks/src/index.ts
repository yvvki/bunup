import {existsSync, mkdirSync, rmSync} from 'node:fs';
import {performance} from 'node:perf_hooks';

import {build as bunupBuild} from 'bunup';
import {build as tsdownBuild} from 'tsdown';
import {build as tsupBuild} from 'tsup';

const ITERATIONS = 3;
const ENTRY_POINT = 'src/project/index.ts';

interface BenchmarkResult {
      name: string;
      format: string;
      dts: boolean;
      averageTime: number;
      relativeSpeed: number;
}

async function cleanOutputDirs() {
      const dirs = ['bunup-dist', 'tsdown-dist', 'tsup-dist'];
      for (const dir of dirs) {
            if (existsSync(dir)) {
                  rmSync(dir, {recursive: true, force: true});
            }
            mkdirSync(dir, {recursive: true});
      }
}

async function runBunupBenchmark(withDts: boolean): Promise<number> {
      const times: number[] = [];

      for (let i = 0; i < ITERATIONS; i++) {
            const start = performance.now();
            await bunupBuild(
                  {
                        entry: [ENTRY_POINT],
                        outDir: 'bunup-dist',
                        format: ['esm', 'cjs'],
                        dts: withDts,
                        minify: true,
                        clean: true,
                  },
                  process.cwd(),
            );
            const end = performance.now();
            times.push(end - start);
      }

      return times.reduce((sum, time) => sum + time, 0) / times.length;
}

async function runTsdownBenchmark(withDts: boolean): Promise<number> {
      const times: number[] = [];

      for (let i = 0; i < ITERATIONS; i++) {
            const start = performance.now();
            await tsdownBuild({
                  entry: [ENTRY_POINT],
                  outDir: 'tsdown-dist',
                  format: ['esm', 'cjs'],
                  minify: true,
                  treeshake: true,
                  clean: true,
                  dts: withDts,
            });
            const end = performance.now();
            times.push(end - start);
      }

      return times.reduce((sum, time) => sum + time, 0) / times.length;
}

async function runTsupBenchmark(withDts: boolean): Promise<number> {
      const times: number[] = [];

      for (let i = 0; i < ITERATIONS; i++) {
            const start = performance.now();
            await tsupBuild({
                  entry: [ENTRY_POINT],
                  outDir: 'tsup-dist',
                  format: ['esm', 'cjs'],
                  dts: withDts,
                  minify: true,
                  treeshake: true,
                  clean: true,
            });
            const end = performance.now();
            times.push(end - start);
      }

      return times.reduce((sum, time) => sum + time, 0) / times.length;
}

async function runBenchmarks() {
      console.log('Running benchmarks...\n');
      await cleanOutputDirs();

      const results: BenchmarkResult[] = [];

      // Run without dts
      const tsupTime = await runTsupBenchmark(false);
      const tsdownTime = await runTsdownBenchmark(false);
      const bunupTime = await runBunupBenchmark(false);

      results.push(
            {
                  name: 'bunup',
                  format: 'esm, cjs',
                  dts: false,
                  averageTime: bunupTime,
                  relativeSpeed: tsupTime / bunupTime,
            },
            {
                  name: 'tsdown',
                  format: 'esm, cjs',
                  dts: false,
                  averageTime: tsdownTime,
                  relativeSpeed: tsupTime / tsdownTime,
            },
            {
                  name: 'tsup',
                  format: 'esm, cjs',
                  dts: false,
                  averageTime: tsupTime,
                  relativeSpeed: 1,
            },
      );

      // Run with dts
      await cleanOutputDirs();
      const tsupTimeDts = await runTsupBenchmark(true);
      const tsdownTimeDts = await runTsdownBenchmark(true);
      const bunupTimeDts = await runBunupBenchmark(true);

      results.push(
            {
                  name: 'bunup (+ dts)',
                  format: 'esm, cjs',
                  dts: true,
                  averageTime: bunupTimeDts,
                  relativeSpeed: tsupTimeDts / bunupTimeDts,
            },
            {
                  name: 'tsdown (+ dts)',
                  format: 'esm, cjs',
                  dts: true,
                  averageTime: tsdownTimeDts,
                  relativeSpeed: tsupTimeDts / tsdownTimeDts,
            },
            {
                  name: 'tsup (+ dts)',
                  format: 'esm, cjs',
                  dts: true,
                  averageTime: tsupTimeDts,
                  relativeSpeed: 1,
            },
      );

      outputResults(results);
      generateTableForReadme(results);
}

function outputResults(results: BenchmarkResult[]) {
      console.log('Results:');
      console.log('--------');

      for (const result of results) {
            console.log(
                  `${result.name.padEnd(20)} | Format: ${result.format.padEnd(10)} | Time: ${result.averageTime.toFixed(2)}ms | Relative Speed: ${result.relativeSpeed.toFixed(1)}x`,
            );
      }
}

function generateTableForReadme(results: BenchmarkResult[]) {
      const markdownTable = `| Bundler        | Format   | Build Time | Relative Speed       |
| -------------- | -------- | ---------- | -------------------- |
${results
      .map(
            result =>
                  `| ${result.name.padEnd(14)} | ${result.format} | **${result.averageTime.toFixed(0)}ms**    | ${
                        result.name.includes('bunup')
                              ? `**⚡️ ${result.relativeSpeed.toFixed(1)}x faster**`
                              : result.name.includes('tsdown')
                                ? `${result.relativeSpeed.toFixed(1)}x faster`
                                : 'baseline'
                  }  |`,
      )
      .join('\n')}`;

      console.log('\nMarkdown Table for README:');
      console.log(markdownTable);
}

runBenchmarks().catch(console.error);
runBenchmarks().catch(console.error);
