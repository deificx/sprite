const button: string = `
		<button on-click='handle'>
			{{title}}
		</button>`;

const checkbox: string = `
		<label for="{{id}}" class="checkbox">
			<input type="checkbox" id="{{id}}" checked="{{selectedValue}}"> {{title}}
		</label>`;

const dropdown: string = `
		<label for="{{id}}">{{title}}</label>
		<select id="{{id}}" value="{{selectedValue}}" >
			{{#options }}
			<option value={{this.value}}>{{this.label}}</option>
			{{/options}}
		</select>`;

const slider: string = `
		<label for="{{id}}">{{title}}</label>
		<input type="range" id="{{id}}" min="{{min}}" max="{{max}}" value={{selectedValue}} />`;

const templates = {
	button: button,
	checkbox: checkbox,
	dropdown: dropdown,
	slider: slider,
};

export default templates;
