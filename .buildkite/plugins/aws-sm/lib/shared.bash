#!/bin/bash

BUILDKITE_PLUGIN_AWS_SM_ENDPOINT_URL="${BUILDKITE_PLUGIN_AWS_SM_ENDPOINT_URL:-}"
BUILDKITE_PLUGIN_AWS_SM_REGION="${BUILDKITE_PLUGIN_AWS_SM_REGION:-}"

function strip_quotes() {
  echo "${1}" | sed "s/^[[:blank:]]*//g;s/[[:blank:]]*$//g;s/[\"']//g"
}

function get_secret_value() {
  local secretId="$1"
  local allowBinary="${2:-}"
  local regionFlag=""
  local endpointUrlFlag=""

  local arnRegex='^arn:aws:secretsmanager:([^:]+):'
  if [[ "${secretId}" =~ $arnRegex ]] ; then
    regionFlag="--region ${BASH_REMATCH[1]}"
  fi

  if [[ -n "${BUILDKITE_PLUGIN_AWS_SM_REGION}" ]] ; then
    regionFlag="--region ${BUILDKITE_PLUGIN_AWS_SM_REGION}"
  fi

  if [[ -n "${BUILDKITE_PLUGIN_AWS_SM_ENDPOINT_URL}" ]] ; then
    endpointUrlFlag="--endpoint-url ${BUILDKITE_PLUGIN_AWS_SM_ENDPOINT_URL}"
  fi

  local secrets;
  echo -e "\033[31m" >&2
  secrets=$(aws secretsmanager get-secret-value \
      --secret-id "${secretId}" \
      --version-stage AWSCURRENT \
      $regionFlag \
      $endpointUrlFlag \
      --output json \
      --query '{SecretString: SecretString, SecretBinary: SecretBinary}')

  local result=$?
  echo -e "\033[0m" >&2
  if [[ $result -ne 0 ]]; then
    exit 1
  fi

  local secretBinary=$(echo "${secrets}" | jq -r '.SecretBinary | select(. != null)')
  if [[ -n "${secretBinary}" ]]; then
    if [[ "${allowBinary}" == "allow-binary" ]]; then
      echo "${secretBinary}" | base64 -d
      return
    fi
    echo -e "\033[31mBinary encoded secret cannot be used in this way (e.g. env var)\033[0m" >&2
    exit 1
  fi

  echo "${secrets}" | jq -r '.SecretString'
}
