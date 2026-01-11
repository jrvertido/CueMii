#!/usr/bin/env node
/**
 * License Key Generator for BADDIXX CueMii App
 * Usage: node generate-license.js YYYY-MM-DD maxPlayers
 * Example: node generate-license.js 2026-12-31 150
 */

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node generate-license.js YYYY-MM-DD maxPlayers');
  console.log('Example: node generate-license.js 2026-12-31 150');
  process.exit(1);
}

const date = args[0];
const maxPlayers = parseInt(args[1], 10);

// Validate date format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(date)) {
  console.error('Error: Date must be in YYYY-MM-DD format');
  process.exit(1);
}

// Validate max players
if (isNaN(maxPlayers) || maxPlayers < 1 || maxPlayers > 999) {
  console.error('Error: Max players must be between 1 and 999');
  process.exit(1);
}

// Generate license
const licenseString = `baddixx-${date}-p${maxPlayers}`;
const encodedLicense = Buffer.from(licenseString).toString('base64');

console.log('');
console.log('License Generated Successfully!');
console.log('===============================');
console.log('Expiration Date:', date);
console.log('Max Players:', maxPlayers);
console.log('');
console.log('License Key:');
console.log(encodedLicense);
console.log('');
