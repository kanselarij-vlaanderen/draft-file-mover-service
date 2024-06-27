import fs from "fs";

function rstrip(value, strippedCharacters) {
  let end = value.length - 1;
  while (strippedCharacters.includes(value.charAt(end))) end -= 1;
  return value.substr(0, end + 1);
}

const RELATIVE_STORAGE_PATH =
  process.env.MU_APPLICATION_FILE_STORAGE_PATH ?? "";

const STORAGE_PATH = `/share/${RELATIVE_STORAGE_PATH}`;
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH);
}

const FILE_RESOURCE_BASE_URI = rstrip(
  process.env.FILE_RESOURCE_BASE_URI ??
    "http://themis.vlaanderen.be/id/bestand",
  "/",
);

export { STORAGE_PATH, FILE_RESOURCE_BASE_URI };
