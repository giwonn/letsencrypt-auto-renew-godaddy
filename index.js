import dotenv from 'dotenv';
import renew from "./renew.js";
import cleanUp from "./cleanup.js";

async function main() {
	const [command] = process.argv.slice(2);

	const run = {
		'renew': renew,
		'cleanup': cleanUp,
	}
	if (!run[command]) throw Error('invalid command');

	await run[command]();
}

dotenv.config({ path: '/usr/src/ssl-auto-renew/.env' });
await main();