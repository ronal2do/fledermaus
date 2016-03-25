import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import yaml from 'js-yaml';
import striptags from 'striptags';
import escapeHtml from 'escape-html';
import IntlMessageFormat from 'intl-messageformat';
import { DateTimeFormat } from 'intl';
import createFormatCache from 'intl-format-cache';
import _ from 'lodash';

/* eslint-disable no-console */

/**
 * Remove extension from file name.
 *
 * @param {string} filename
 * @return {string}
 */
export function removeExtension(filename) {
	return filename.replace(/\.\w+$/, '');
}

/**
 * Returns extension of a file (without the leading dot).
 *
 * @param {string} filename
 * @return {string}
 */
export function getExtension(filename) {
	return path.extname(filename).substring(1);
}

/**
 * Read text file.
 *
 * @param {string} filepath
 * @return {string}
 */
export function readFile(filepath) {
	return fs.readFileSync(filepath, { encoding: 'utf8' });
}

/**
 * Save text to a file (create all folders if necessary).
 *
 * @param {string} filepath
 * @param {string} content
 * @return {string}
 */
export function writeFile(filepath, content) {
	mkdirp.sync(path.dirname(filepath));
	return fs.writeFileSync(filepath, content, { encoding: 'utf8' });
}

/**
 * Read YAML file.
 *
 * @param {string} filepath
 * @return {string}
 */
export function readYamlFile(filepath) {
	try {
		return yaml.safeLoad(readFile(filepath));
	}
	catch (e) {
		console.log(`Cannot read YAML file ${filepath}:`, e);
	}
}

/**
 * Prepare fields list in short format to _.orderBy()
 * @param {Array} shortFields ['foo', '-bar']
 * @return {Array}
 */
export function formatFieldsForSortByOrder(shortFields) {
	return _.unzip(shortFields.map((field) => {
		if (field[0] === '-') {
			return [field.substr(1), 'desc'];
		}
		return [field, 'asc'];
	}));
}

/**
 * Returns HTML meta tag.
 *
 * @param {string} name Meta name.
 * @param {string} content Meta value.
 * @return {string}
 */
export function meta(name, content) {
	content = cleanHtml(content);
	return `<meta name="${name}" content="${content}">`;
}

/**
 * Returns HTML meta tag for Open Graph.
 *
 * @param {string} name Meta name.
 * @param {string} content Meta value.
 * @return {string}
 */
export function og(name, content) {
	content = cleanHtml(content);
	return `<meta property="${name}" content="${content}">`;
}

/**
 * Return the content of the first paragraph in a given HTML.
 *
 * @param {string} text
 * @return {string}
 */
export function getFirstParagraph(text) {
	let m = text.match(/<p[^>]*>(.*?)<\/p>/i);
	return m && m[1];
}

/**
 * Return the URL of the first image in a given HTML.
 *
 * @param {string} text
 * @return {string}
 */
export function getFirstImage(text) {
	let m = text.match(/<img\s+src=["']([^"']+)["']/i);
	return m && m[1];
}

/**
 * Remove HTML and escape special characters.
 *
 * @param {string} text
 * @return {string}
 */
export function cleanHtml(text) {
	return escapeHtml(striptags(text)).trim();
}

/**
 * Print message immidiately and show execution time on process exit.
 *
 * @param {string} message
 */
export function start(message) {
	console.log(message);
	let startTime = new Date().getTime();

	process.on('exit', () => {
		let time = new Date().getTime() - startTime;
		let minutes = Math.floor(time / 1000 / 60) % 60;
		let seconds = Math.floor(time / 1000) % 60;
		console.log(
			'Done in', (minutes ? `${minutes}m ` : '') + (seconds ? `${seconds}s` : '') +
			(!minutes && !seconds ? 'a moment' : '')
		);
	});
}

/**
 * Intl message formatter.
 *
 * @param {string} format Format string.
 * @param {string} lang Language.
 */
export const getMessageFormat = createFormatCache(IntlMessageFormat);

/**
 * Intl date/time formatter.
 *
 * @param {string} lang Language.
 * @param {Object} format Format.
 */
export const getDateTimeFormat = createFormatCache(DateTimeFormat);
