const nearley = require('nearley');
const hclGrammar = require('./hcl_grammar.js');

const copyAndMock = (hclContent, mocks) => {
	return toHCL(parse(hclContent)[0], mocks);
};

const parse = (hclContent) => {
	const hclParser = new nearley.Parser(nearley.Grammar.fromCompiled(hclGrammar));
	const parsed = hclParser.feed(hclContent);

	return parsed.results;
};

const toHCL = (parsed, mocks) => {
	let result = '';

	for (entry of parsed) {
		if (entry == null) {
			// Skip
		} else if (Array.isArray(entry)) {
			if (!matchesName(entry, mocks)) {
				result += toHCL(entry, mocks);
			}
		} else if (entry.type == 'variable') {
			result += substituteVariableWithMockValue(entry, mocks);
		} else if (entry.type == 'string_literal') {
			result += substituteLiteralWithMockValue(entry, mocks);
		} else if (!entry.meta) {
			result += entry.text;
		}
	}

	return result;
};

const matchesName = (parsed, mocks) => {
	if (mocks && parsed && parsed.length > 0 && parsed[0].type === 'block') {
		if (mocks[parsed[0].name]) return true;
	}
	return false;
};

const lookupMockedValue = (value, mocks) => {
	const lastDotIndex = value.lastIndexOf('.');
	if (lastDotIndex < 0) return value;

	const path = value.substring(0, lastDotIndex);
	const property = value.substring(lastDotIndex + 1);

	let mock = mocks[path];
	if (!mock) mock = mocks[`resource.${path}`]; // Resources have a special naming

	if (mock) {
		return mock[property];
	}
};

const substituteVariableWithMockValue = (entry, mocks) => {
	const value = entry.text;
	if (!value || !mocks) return value;

	const mocked = lookupMockedValue(value, mocks);
	return mocked ? JSON.stringify(mocked) : value;
};

const substituteLiteralWithMockValue = (entry, mocks) => {
	const value = entry.text;
	if (!value || !mocks) return value;

	const regex = /([^\$]*)(?:\${([^}]*)})*/g;
	let m;

	let result = '';

	while ((m = regex.exec(value)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}

		m.forEach((match, groupIndex) => {
			if (groupIndex == 1) {
				// static part
				result += match;
			} else if (groupIndex == 2 && match) {
				// interpolated path
				const mocked = lookupMockedValue(match, mocks);
				result += mocked ? mocked : match;
			}
		});
	}

	return result;
};

module.exports = { parse, toHCL, copyAndMock };
