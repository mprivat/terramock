const fs = require('fs').promises;
const path = require('path');

const hclParser = require('./hcl.js');

const copy = async (from, to) => {
	const sourceCheck = await fs.stat(from).catch((err) => {
		if (err.code === 'ENOENT') {
			return false;
		}
		throw err;
	});

	if (!sourceCheck) {
		throw Error(`The source path does not exist: ${from}`);
	}

	if (!sourceCheck.isDirectory()) {
		throw Error(`The source must be a directory: ${from}`);
	}

	await fs.mkdir(to, { recursive: true });

	await scan(from, to);
};

const scan = async (dir, destination) => {
	entries = (await fs.readdir(dir)).filter((file) => file.endsWith('.tf'));
	for (entry of entries) {
		const fileName = entry;
		const content = await scanFile(path.join(dir, entry));

		await fs.writeFile(path.join(destination, fileName), content, 'utf8');
	}
};

const scanFile = async (entry) => {
	let content = await fs.readFile(entry, 'utf8');
	return hclParser.copyAndMock(content);
};

module.exports = { copy };
