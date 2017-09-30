
'use strict';

const icon = require('../assets/icon.png');
const Preview = require('./preview');


const aptoidePlugin = ({ term, actions, display }) => {



	let goSearch = (searchTerm) => {
		const q = encodeURIComponent(searchTerm);
		actions.open(`https://en.aptoide.com/search?type=apps&query=${q}`);
		actions.hideWindow()
	};

	let match = term.match(/^aptoide\s+(.{2,})/i);

	if (match){

		let term = match[1];
		let store = null;

		let match_store = term.match(/(.{2,})@(.+)/i);
		if (match_store) {
			term = match_store[1];
			store = match_store[2];
		} else {
			let almost_match_store = term.match(/(.{2,})@$/i);
			if (almost_match_store) {
				term = almost_match_store[1];
			}
		}

		let title = `Search Aptoide for '${term}'`;

		display({
			icon,
			title: title,
			onSelect: () => goSearch(term, store),
			getPreview: () => <Preview query={term} store={store} actions={actions} />

		});
	}
};

module.exports = {
	icon,
	name: 'Search for Android Apps in Aptoide',
  	fn: aptoidePlugin
};


