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
	return new Promise(async (resolve, reject) => {
		const asdf = await KitsuAPI.search(50, parseInt(req.query["p"]), parseInt(req.query["r"]), parseInt(req.query["m"]), req.query["q"]);
		console.log(asdf);
		resolve("");
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