NODE_BIN=node_modules/.bin

check: lint test

node_modules: package.json
	yarn && touch $@

lint: | node_modules
	$(NODE_BIN)/biome ci

format: | node_modules
	$(NODE_BIN)/biome check --fix

test: | node_modules
	node --test $(TEST_OPTS) test/test.js

test-cov: TEST_OPTS += --experimental-test-coverage
test-cov: test

test-manual: | node_modules
	node test/manual

clean:
	rm -rf temp
.PHONY: check clean format lint test test-cov test-manual
