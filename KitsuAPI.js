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
			return query.split(" ").join("%20");
	}
}

function kitsuDirectConvert(json = {}) {
	let s = `${json.SetID}|${json.Artist}|${json.Title}|${json.Creator}|${json.RankedStatus}|10.00000|${new Date(json.LastUpdate).getTime()}|${json.SetID}|${json.ChildrenBeatmaps[0].BeatmapID}|0|0|0||`;
	for (let diff of json.ChildrenBeatmaps) {
		s += `${diff.DiffName}@${diff.Mode},`;
	}
	s = s.substring(0, s.length - 1);

	return s;
}

function statusConverter(status = 0) {
	switch (status) {
		case 0:
		case 7:
			return 1;

		case 2:
			return 0;

		case 3:
			return 3;

		case 4:
			return -50;

		case 5:
			return -2;

		case 8:
			return 4;

		default:
			return 1;
	}
}

async function search(amount = 40, page = 0, status = 1, mode = 0, query = "") {
	const response = await AsyncHttpRequest(`https://kitsu.moe/api/search?amount=50&offset=${amount * page}${(status == 4 ? "" : `&status=${statusConverter(status)}`)}${(mode == -1 ? "" : `&mode=${mode}`)}&query=${queryConverter(query)}`, RequestType.JSON);

	return response;
}

module.exports = {
	search: search,
	kitsuDirectConvert: kitsuDirectConvert,
}