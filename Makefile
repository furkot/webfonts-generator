NODE_BIN=node_modules/.bin

check: lint test

node_modules: package.json
	yarn && touch $@

lint: | node_modules
	$(NODE_BIN)/jshint index.js lib test

test: | node_modules
	$(NODE_BIN)/mocha --reporter spec test/test.js

test-manual: | node_modules
	node test/manual

clean:
	rm -rf temp

.PHONY: lint check test test-manual clean
