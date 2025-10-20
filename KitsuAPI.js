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

function kitsuDirectListingConvert(json = {}) {
	let s = `${json.SetID}.osz|${json.Artist}|${json.Title}|${json.Creator}|${json.RankedStatus}|10.00000|${json.LastUpdate}|${json.SetID}|${json.ChildrenBeatmaps[0].BeatmapID}|0|0|0||`;
	for (let diff of json.ChildrenBeatmaps) {
		s += `${diff.DiffName}@${diff.Mode},`;
	}
	s = s.substring(0, s.length - 1);

	return s;
}

function kitsuDirectSingleConvert(json) {
	return `${json.SetID}.osz|${json.Artist}|${json.Title}|${json.Creator}|${1}|10.00000|${0}|${json.SetID}|${json.SetID}|0|0|0|`;
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
	return await (await fetch(`https://kitsu.moe/api/search?amount=50&offset=${amount * page}${(status === 4 ? "" : `&status=${statusConverter(status)}`)}${(mode === -1 ? "" : `&mode=${mode}`)}&query=${queryConverter(query)}`)).json();
}

async function searchSingle(beatmapId = 0) {
	const beatmap = await (await fetch(`https://kitsu.moe/api/b/${beatmapId}`, RequestType.JSON)).json(); // Get beatmap the client requested

	if (beatmap != null && beatmap instanceof Object) {
		return await (await fetch(`https://kitsu.moe/api/s/${beatmap.ParentSetID}`, RequestType.JSON)).json(); // Get the parent set from the beatmap
	}
	else return null;
}

module.exports = {
	search: search,
	searchSingle: searchSingle,
	kitsuDirectListingConvert: kitsuDirectListingConvert,
	kitsuDirectSingleConvert: kitsuDirectSingleConvert
}
