import { app, uuid, errorHandler } from "mu";
import { createFile, getFile } from "./lib/file";
import fs from "fs";
import { FILE_RESOURCE_BASE_URI, STORAGE_PATH } from "./cfg";

const cacheClearTimeout = process.env.CACHE_CLEAR_TIMEOUT || 5000;

app.get("/", function (req, res) {
  res.send("Hello from draft-file-mover");
});

app.post("/draft-files/:id/move", async function (req, res) {
  const fileId = req.params.id;
  const file = await getFile(fileId);

  const now = new Date();

  // generate file IDs & path for copy of file
  const virtualUuid = uuid();
  const physicalUuid = uuid();
  const physicalName = `${physicalUuid}.${file.extension}`;

  const copyFilePath = `${STORAGE_PATH}/${physicalName}`;

  // make copy of file
  fs.copyFileSync(file.physicalUri.replace("share://", "/share/"), copyFilePath);

  // create triples in Kanselarij graph, using mu-auth
  const physicalFile = {
    id: physicalUuid,
    uri: copyFilePath.replace("/share/", "share://"),
    name: physicalName,
    extension: file.extension,
    size: file.size,
    created: now,
    format: file.format,
  };

  const virtualFile = {
    id: virtualUuid,
    uri: `${FILE_RESOURCE_BASE_URI}/${virtualUuid}`,
    name: file.name,
    extension: file.extension,
    size: file.size,
    created: now,
    format: file.format,
    physicalFile,
  };
  await createFile(virtualFile);

  await new Promise((resolve) => setTimeout(resolve, cacheClearTimeout));
  return res.status(200).send({
    data: {
      type: 'files',
      id: virtualFile.id,
    }
  });
});

app.use(errorHandler);
