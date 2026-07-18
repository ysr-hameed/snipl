import type { RegistryItem } from '@snipl/registry-schema';
import type { WritePlan } from '@snipl/core';
import type { WriteResult } from '@snipl/core';

export function printItemList(items: RegistryItem[]): void {
  for (const item of items) {
    console.log(`${item.name.padEnd(20)} ${item.summary}`);
  }
}

export function printItemDetail(item: RegistryItem): void {
  console.log(`\n  ${item.name}@${item.version}`);
  console.log(`  ${'─'.repeat(40)}`);
  console.log(`  ${item.summary}`);
  console.log(`  Language: ${item.language}`);
  console.log(`  Environments: ${item.environments.join(', ')}`);
  console.log(`  License: ${item.license.spdx} (${item.license.source})`);
  if (item.license.attribution) {
    console.log(`  Attribution: ${item.license.attribution}`);
  }
  console.log('');
  console.log('  Exports:');
  for (const exp of item.exports) {
    console.log(`    ${exp.kind} ${exp.name}`);
  }
  console.log('');
  console.log('  Files:');
  for (const file of item.files) {
    console.log(`    ${file.path}`);
  }
  console.log('');
  console.log('  Usage:');
  console.log(`    ${item.docs.usage}`);
  if (item.docs.caveats.length > 0) {
    console.log('');
    console.log('  Caveats:');
    for (const caveat of item.docs.caveats) {
      console.log(`    ⚠ ${caveat}`);
    }
  }
  console.log('');
}

export function printWritePlan(plan: WritePlan, item: RegistryItem): void {
  console.log(`\n  Will install ${item.name}@${item.version}\n`);
  for (const entry of plan.entries) {
    const action = entry.type === 'create' ? 'create' : 'overwrite';
    console.log(`  ${action.padEnd(12)} ${entry.targetPath}`);
  }
  if (plan.collisions.length > 0) {
    console.log('\n  Collisions (use --overwrite to replace):');
    for (const coll of plan.collisions) {
      console.log(`    ${coll}`);
    }
  }
  console.log('');
}

export function printWriteResult(result: WriteResult, itemName: string): void {
  if (result.success) {
    console.log(`  ✓ Installed ${itemName} (${result.written.length} file(s))`);
  } else {
    console.log(`  ✗ Failed to install ${itemName}`);
    if (result.written.length > 0) {
      console.log(`    Written: ${result.written.length} file(s)`);
    }
    if (result.failed.length > 0) {
      console.log(`    Failed: ${result.failed.length} file(s)`);
      for (const f of result.failed) {
        console.log(`      - ${f}`);
      }
    }
    if (result.restored.length > 0) {
      console.log(`    Restored: ${result.restored.length} file(s)`);
    }
  }
}
