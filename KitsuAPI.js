const AsyncHttpRequest = require("./AsyncHttpRequest.js"), RequestType = require("./RequestType.json");

function queryConverter(query = "") {
	query = query.split("+").join(" ");

	switch (query) {
		case "Newest":
		case "Top Rated": // Kitsu doesn't keep track of rating so just fold it into "Newest".
			return "[sort=date:DESC]";

		case "Most Played":
			return "[sort=playcount]";

		default:
			return query;
	}
}

async function search(amount = 50, page = 0, status = 1, mode = 0, query = "") {
	const response = await AsyncHttpRequest(`https://kitsu.moe/api/search?amount=50&offset=${amount * page}${(status == 4 ? "" : `&status=${status}`)}${(mode == -1 ? "" : `&mode=${mode}`)}&query=${queryConverter(query)}`, RequestType.JSON);

	return response;	
}

module.exports = {
	search: search,
}