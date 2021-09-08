const app = require("express")(), fs = require("fs");

const KitsuAPI = require("./KitsuAPI.js");

if (!fs.existsSync("./.data/")) {
	fs.mkdirSync("./.data");
}

app.get("*", async (req, res) => {
	switch (req.url.split("?")[0]) {
		case "/web/osu-search.php":
			return res.end(await osu_search(req));

		case "/web/osu-search-set.php":
			return res.end(await osu_search_set(req));

		default:
			// I think this is a fine way to catch the "/d/<number>" urls?
			if (req.url.startsWith("/d/"))
				return await download_handler(req, res);

			else return res.status(404).end("it's a 404 man, you fucked up.");
	}
});

app.listen(5014, () => {
	console.log("up at 5014");
});

async function osu_search(req) {
	console.log("Starting search...");
	const timeStart = new Date().getTime();
	return new Promise(async (resolve, reject) => {
		const searchData = await KitsuAPI.search(39, parseInt(req.query["p"]), parseInt(req.query["r"]), parseInt(req.query["m"]), req.query["q"]);
		let directString = "";
		if (searchData.length >= 40) {
			directString += 101;
		} else {
			directString += searchData.length;
		}
		
		directString += "\r\n";

		for (let set of searchData) {
			directString += `${KitsuAPI.kitsuDirectConvert(set)}\r\n`;
		}
		//console.log(directString);
		console.log(`webreq took ${new Date().getTime() - timeStart}ms`);
		resolve(directString);
	});
}

async function osu_search_set(req) {
	return new Promise((resolve, reject) => {

	});
}

async function download_handler(req, res) {
	const beatmapId = req.url.split("/").slice(-1)[0];
	console.log(beatmapId);
}