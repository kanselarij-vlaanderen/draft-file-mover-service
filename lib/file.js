import {
  query,
  update,
  sparqlEscapeUri,
  sparqlEscapeInt,
  sparqlEscapeString,
  sparqlEscapeDateTime,
} from "mu";
import { parseSparqlResults } from "./util";

/**
 * @param {string} id The id of the file to retrieve
 * @returns {Promise<any>} A record containing the id, name, extension and uris
 */
async function getFile(id) {
  const q = `PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
PREFIX dbpedia: <http://dbpedia.org/ontology/>
PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
PREFIX subm: <http://mu.semte.ch/vocabularies/ext/submissions/>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT DISTINCT (?virtualFile AS ?uri) (?physicalFile AS ?physicalUri) (?uuid as ?id) ?name ?extension ?size ?format
WHERE {
    ?virtualFile a ?type ;
        mu:uuid ${sparqlEscapeString(id)} ;
        mu:uuid ?uuid .
    ?physicalFile a subm:VoorlopigBestand ;
        nie:dataSource ?virtualFile .
    ?virtualFile nfo:fileName ?name ;
                 dbpedia:fileExtension ?extension ;
                 nfo:fileSize ?size ;
                 dct:format ?format .
}`;
  const result = await query(q);
  const parsed = parseSparqlResults(result);
  if (parsed?.length) return parsed[0];
  return null;
}

/**
 * @param {VirtualFile} file The file that should be persisted in the database
 * @returns {Promise}
 */
async function createFile(file) {
  const q = `PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
PREFIX dbpedia: <http://dbpedia.org/ontology/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>

INSERT DATA {
  ${sparqlEscapeUri(file.uri)} a nfo:FileDataObject ;
    nfo:fileName ${sparqlEscapeString(file.name)} ;
    mu:uuid ${sparqlEscapeString(file.id)} ;
    dct:format ${sparqlEscapeString(file.format)} ;
    nfo:fileSize ${sparqlEscapeInt(file.size)} ;
    dbpedia:fileExtension ${sparqlEscapeString(file.extension)} ;
    dct:created ${sparqlEscapeDateTime(file.created)} ;
    dct:modified ${sparqlEscapeDateTime(file.created)} .
  ${sparqlEscapeUri(file.physicalFile.uri)} a nfo:FileDataObject ;
    nie:dataSource ${sparqlEscapeUri(file.uri)} ;
    nfo:fileName ${sparqlEscapeString(file.physicalFile.name)} ;
    mu:uuid ${sparqlEscapeString(file.physicalFile.id)} ;
    dct:format ${sparqlEscapeString(file.physicalFile.format)} ;
    nfo:fileSize ${sparqlEscapeInt(file.physicalFile.size)} ;
    dbpedia:fileExtension ${sparqlEscapeString(file.physicalFile.extension)} ;
    dct:created ${sparqlEscapeDateTime(file.physicalFile.created)} ;
    dct:modified ${sparqlEscapeDateTime(file.physicalFile.created)} .
}`;
  await update(q);
}

export { getFile, createFile };
