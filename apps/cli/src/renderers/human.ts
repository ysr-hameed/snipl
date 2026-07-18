import type { RegistryItem } from '@snipl/registry-schema';

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
