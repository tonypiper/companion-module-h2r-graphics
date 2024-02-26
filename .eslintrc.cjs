module.exports = {
	extends: ['./node_modules/@companion-module/tools/eslint/main.cjs'],
	overrides: [
		{
			files: ['tests/**/*.js'],
			env: {
				jest: true,
			},
		},
	],
}
