default:
    @just --list

# Elm bundle, embedded into the Go binary
web:
    cd web && elm make src/Main.elm --optimize --output=../internal/server/static/app.js

build: web
    go build -o bin/gebed ./cmd/gebed

test:
    go test -timeout 10s ./...
    cd web && elm-test

lint:
    golangci-lint run ./...
    cd web && elm-format --validate src

fmt:
    gofmt -w .
    cd web && elm-format --yes src tests
    nixfmt flake.nix

dev:
    watchexec -e elm,go -r -- just build
