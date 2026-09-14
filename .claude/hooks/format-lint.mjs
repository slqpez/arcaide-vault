#!/usr/bin/env node
// PostToolUse hook: runs Prettier (and ESLint --fix for JS/TS/React files)
// on the file that Write/Edit just touched. Reads the hook event JSON from
// stdin per Claude Code's hook protocol.

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const JS_TS_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx']);

async function readStdinAsync() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    shell: true,
    stdio: 'ignore',
  });
  return result.status === 0;
}

async function main() {
  const raw = await readStdinAsync();
  if (!raw) return;

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return;
  }

  const filePath = event?.tool_input?.file_path;
  if (!filePath) return;

  const ext = path.extname(filePath).toLowerCase();
  const cwd = event.cwd || process.cwd();

  if (JS_TS_EXTENSIONS.has(ext)) {
    runCommand('npx', ['prettier', '--write', JSON.stringify(filePath)], cwd);
    runCommand('npx', ['eslint', '--fix', JSON.stringify(filePath)], cwd);
  } else if (MARKDOWN_EXTENSIONS.has(ext)) {
    runCommand('npx', ['prettier', '--write', JSON.stringify(filePath)], cwd);
  }
}

main();
