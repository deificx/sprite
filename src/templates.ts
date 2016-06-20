const checkbox: string = '' +
	'		<label for="{{id}}" class="checkbox">\n' +
	'			<input type="checkbox" id="{{id}}" checked="{{selectedValue}}"> {{title}}\n' +
	'		</label>\n';

const dropdown: string = '' +
	'		<label for="{{id}}">{{title}}</label>\n' +
	'		<select id="{{id}}" value="{{selectedValue}}" >\n' +
	'			{{#options }}\n' +
	'			<option value={{this.value}}>{{this.label}}</option>\n' +
	'			{{/options}}\n' +
	'		</select>\n';

const slider: string = '' +
	'		<label for="{{id}}">{{title}}</label>\n' +
	'		<input type="range" id="{{id}}" min="{{min}}" max="{{max}}" value={{selectedValue}} />\n';

const templates = {
	checkbox: checkbox,
	dropdown: dropdown,
	slider: slider,
};

export default templates;
