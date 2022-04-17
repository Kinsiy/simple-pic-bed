/*
 * @Date: 2022-04-13 19:45:29
 * @Author: Kinsiy
 * @LastEditors: Kinsiy
 * @LastEditTime: 2022-04-17 12:20:56
 * @FilePath: \picBed\src\index.js
 */
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as ip from "ip";
import * as mime from "mime-types";

import { fileURLToPath } from "url";
import { dirname } from "path";

import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";

import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let hostname = process.env["HOST_NAME"];
switch (hostname) {
	case "":
	case "localhost":
	case "127.0.0.1":
		hostname = ip.default.address();
		break;
	default:
		break;
}

const port = process.env["PORT"] || "7070";
const uploadFolder = process.env["UPLOAD_FOLDER"] || path.join(__dirname, "..", "pics");
const validTypes = process.env["VALID_TYPES"] || [];

const server = http.createServer();

server.on("request", (req, res) => {
	res.setHeader("Content-Type", "text/plain");

	if (req.url === "/upload" && req.method.toLowerCase() === "post") {
		// parse a file upload
		const form = formidable({});

		form.parse(req, (err, fields, files) => {
			if (err) {
				res.statusCode = err.httpCode || 400;
				res.end(String(err));
				return;
			}

			const file = files.file[0];

			// checks if the file is valid
			const isValid = isFileValid(file);

			// rename file be unique
			const fileName = file.originalFilename.replace(/^.*(?=\.)/, uuidv4());

			if (!isValid) {
				// throes error if file isn't valid
				res.statusCode = 400;
				res.end("The file type is not a valid type");
				return;
			}

			let httpCode, result;
			try {
				// store file
				fs.copyFile(file.filepath, path.join(uploadFolder, fileName), function (err) {
					if (err) throw new Error(err);
				});
				httpCode = 200;
				result = `http://${hostname}:${port}/upload/${fileName}`;
			} catch (error) {
				httpCode = 500;
				result = "Image save failed! " + error.message;
			}
			res.statusCode = httpCode;
			res.end(result);
		});
		return;
	}

	if (/\/upload\/[^\/]+/.test(req.url) && req.method.toLowerCase() === "get") {
		const resFileName = req.url.split("/").pop();
		let imagePath = path.join(uploadFolder, resFileName);

		if (fs.existsSync(imagePath)) {
			// Content-type is very interesting part that guarantee that
			// Web browser will handle response in an appropriate manner.
			res.writeHead(200, {
				"Content-Type": mime.lookup(imagePath),
				"Content-Disposition": "inline;",
			});
			fs.createReadStream(imagePath).pipe(res);
			return;
		}
		res.statusCode = 404;
		res.end("ERROR File does not exist");
		return;
	}

	res.statusCode = 400;
	res.end("400! bad request!");
});

const isFileValid = (fileName) => {
	const type = fileName.mimetype.split("/").pop();
	return ~validTypes.indexOf(type);
};

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
