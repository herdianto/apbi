/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 * 
 * Rio Simatupang
 * 2017
 */

export function hello() {
	return 'hello';
}

export function getImage(content) {
	var myRegExp = new RegExp(/<img.*?src="(.*?)"/);
	var match = myRegExp.exec(content);
	if (match) {
		return match[1];
	}
}

export function contentSnippet(content) {
	return content.split(/\s+/).slice(0, 50).join(" ")+"...";
}