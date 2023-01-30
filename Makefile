install:
				npm ci

publish:
				npm publish --dry-run

lint:
				npx eslint .

lint-fix:
				npx eslint . --fix

start:
		    npx webpack serve