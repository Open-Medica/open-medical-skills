import chalk from 'chalk';

const DISCLAIMER_TEXT = 'Research and learning tool. Not clinical decision support.';

export function getDisclaimer() {
  return DISCLAIMER_TEXT;
}

export function printDisclaimer() {
  console.log(chalk.gray(`  ${DISCLAIMER_TEXT}\n`));
}

export function getDisclaimerHeader() {
  return { 'X-OMS-Disclaimer': DISCLAIMER_TEXT };
}
