module.exports = {
	extends: ['./node_modules/@companion-module/tools/eslint/main.cjs', 'plugin:jsdoc/recommended'],
	overrides: [
		{
			files: ['tests/**/*.js'],
			env: {
				jest: true,
			},
		},
	],
	plugins: ['jsdoc'],
}
