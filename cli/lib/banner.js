import chalk from 'chalk';

const BANNER = `
${chalk.bold.hex('#0D9488')('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557')}
${chalk.bold.hex('#0D9488')('  \u2551')}  ${chalk.bold.white('Open Medical Skills')}${chalk.gray(' (OMS)')}                   ${chalk.bold.hex('#0D9488')('\u2551')}
${chalk.bold.hex('#0D9488')('  \u2551')}  ${chalk.gray('Physician-reviewed AI agent skills')}            ${chalk.bold.hex('#0D9488')('\u2551')}
${chalk.bold.hex('#0D9488')('  \u2551')}  ${chalk.dim.gray('Research & learning tool \u00b7 Not CDS')}             ${chalk.bold.hex('#0D9488')('\u2551')}
${chalk.bold.hex('#0D9488')('  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d')}
`;

const BANNER_COMPACT = `${chalk.bold.hex('#0D9488')('OMS')} ${chalk.gray('|')} ${chalk.white('Open Medical Skills')} ${chalk.gray('|')} ${chalk.dim('Research tool')}`;

export function printBanner() {
  console.log(BANNER);
}

export function printBannerCompact() {
  console.log(`\n${BANNER_COMPACT}\n`);
}
