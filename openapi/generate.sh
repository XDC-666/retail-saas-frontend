#!/usr/bin/env sh
set -eu
npx openapi-typescript openapi/openapi.yaml -o src/api/generated/schema.d.ts
