const app = require("express")(), fs = require("fs"), { exec } = require("child_process");

const KitsuAPI = require("./KitsuAPI.js");

if (!fs.existsSync("./.data/")) {
	fs.mkdirSync("./.data");
}

let downloadingBeatmaps = {};
let downloadingBeatmapsKeys = Object.keys(downloadingBeatmaps);

function addDownload(key) {
	downloadingBeatmaps[key] = null; // Just nullref lol
	downloadingBeatmapsKeys = Object.keys(downloadingBeatmaps);

	return key;
}

function removeDownload(key) {
	delete downloadingBeatmaps[key]; // Absolutely destroy that guy
	downloadingBeatmapsKeys = Object.keys(downloadingBeatmaps);
}

// Log to the console and the log history file
function log(s) {
    console.log(`[BDMDL] ${s}`);
    fs.appendFile("history.log", `${s}\n`, () => {});
}

app.get("/{*splat}", async (req, res) => {
	switch (req.url.split("?")[0]) {
		case "/":
		case "/index":
		case "/index.html":
			return res.end("KitsuCache - Binato's Direct Handler & Cache");

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
	log(`Server started at ${new Date()} at port ${5014}`);
});

async function osu_search(req) {
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
			directString += `${KitsuAPI.kitsuDirectListingConvert(set)}\r\n`;
		}
		resolve(directString);
	});
}

async function osu_search_set(req) {
	return new Promise(async (resolve, reject) => {
		const searchData = await KitsuAPI.searchSingle(parseInt(req.query["b"]));

		if (searchData != null && searchData instanceof Object) {
			resolve(KitsuAPI.kitsuDirectSingleConvert(searchData));
		}
		else resolve("");
	});
}

async function download_handler(req, res) {
	const beatmapId = parseInt(req.url.split("/").slice(-1)[0].split("?")[0]);
	if (`${beatmapId}` == "NaN") return res.status(404).end("Invalid beatmap ID");
	try {
		fs.access(`./.data/${beatmapId}.osz`, fs.constants.F_OK, (err) => {
			if (err) {
				if (!downloadingBeatmapsKeys.includes(`${beatmapId}.osz`)) {
					const dlKey = addDownload(`${beatmapId}.osz`);
					setTimeout(() => {
						log(`Starting download of ${dlKey}`);
						exec(`wget -O "./.data/${dlKey}" https://kitsu.moe/d/${beatmapId}`, (err, stdout, stderr) => {
							if (stderr.includes("ERROR 404: Not Found")) {
								fs.unlink(`./.data/${dlKey}`, () => {
									removeDownload(dlKey);
									log(`Failed to download beatmap id ${beatmapId}!`);
								});
							} else {
								fs.readFile(`./.data/${dlKey}`, (err, data) => {
									if (err) throw err;
									else {
										if (data.toString() == "you are downloading beatmaps too fast, please wait few seconds...") {
											removeDownload(dlKey);
											log(`Failed to download beatmap id ${beatmapId}! Downloading too quickly!`);
										} else {
											removeDownload(dlKey);
											log(`Finished downloading beatmap id ${beatmapId}!`);
										}
									}
								});
							}
						});
					}, 4000);
					res.redirect(`https://kitsu.moe/d/${beatmapId}`);
				} else {
					res.redirect(`https://kitsu.moe/d/${beatmapId}`);
					log(`Already downloading id ${beatmapId}!`);
				}
			} else {
				log(`The beatmap ${beatmapId} is already downloaded! Sending...`);
				res.sendFile(__dirname + `/.data/${beatmapId}.osz`);
			}
		});
	} catch (e) {
		console.error(e);
	}
}