#!/bin/bash

# Defaults...
BK_AWS_ARGS=""
BK_CACHE_COMPRESS=${BUILDKITE_PLUGIN_CACHE_V2_COMPRESS:-false}
BK_TAR_ARGS=()
BK_TAR_ADDITIONAL_ARGS=""
BK_TAR_EXTENSION="tar"
BK_TAR_EXTRACT_ARGS="-xf"

if [[ ! "$OSTYPE" == "darwin"* ]]; then
  shell_exec=$(
    exec 2>/dev/null
    readlink "/proc/$$/exe"
  )
  case "$shell_exec" in
  */busybox)
    BK_TAR_ADDITIONAL_ARGS=""
    ;;
  esac

  if [[ ! "${BK_CACHE_COMPRESS:-false}" =~ (false) ]]; then
    number_re='^[0-9]+$'
    if [[ ${BK_CACHE_COMPRESS} =~ $number_re ]]; then
      BK_TAR_ARGS=("$BK_TAR_ADDITIONAL_ARGS" --use-compress-program "gzip -$BK_CACHE_COMPRESS" -cf)
    else
      BK_TAR_ARGS=("$BK_TAR_ADDITIONAL_ARGS" -zcf)
    fi
    BK_TAR_EXTENSION="tar.gz"
    BK_TAR_EXTRACT_ARGS="-xzf"
  else
    BK_TAR_ARGS=("$BK_TAR_ADDITIONAL_ARGS" -cf)
  fi
else
  if [[ ! "${BK_CACHE_COMPRESS:-false}" =~ (false) ]]; then
    BK_TAR_ARGS=(-zcf)
  else
    BK_TAR_ARGS=(-cf)
  fi
fi

if [[ -n "${BUILDKITE_PLUGIN_CACHE_V2_S3_PROFILE:-}" ]]; then
  BK_AWS_ARGS="--profile ${BUILDKITE_PLUGIN_CACHE_V2_S3_PROFILE}"
fi

if [[ -n "${BUILDKITE_PLUGIN_CACHE_V2_S3_CLASS:-}" ]]; then
  BK_AWS_ARGS="${BK_AWS_ARGS} --storage-class '${BUILDKITE_PLUGIN_CACHE_V2_S3_CLASS}'"
fi

if [[ -n "${BUILDKITE_PLUGIN_CACHE_V2_S3_ENDPOINT:-}" ]]; then
  BK_AWS_ARGS="${BK_AWS_ARGS} --endpoint-url ${BUILDKITE_PLUGIN_CACHE_V2_S3_ENDPOINT}"
fi

if [[ -n "${BUILDKITE_PLUGIN_CACHE_V2_S3_REGION:-}" ]]; then
  BK_AWS_ARGS="${BK_AWS_ARGS} --region ${BUILDKITE_PLUGIN_CACHE_V2_S3_REGION}"
fi

if [[ -n "${BUILDKITE_PLUGIN_CACHE_V2_S3_ARGS:-}" ]]; then
  BK_AWS_ARGS="${BK_AWS_ARGS} ${BUILDKITE_PLUGIN_CACHE_V2_S3_ARGS}"
fi

function restore() {
  TAR_FILE="${CACHE_KEY}.${BK_TAR_EXTENSION}"
  TKEY="${BUILDKITE_ORGANIZATION_SLUG}/${BUILDKITE_PIPELINE_SLUG}"
  BUCKET="${BUILDKITE_PLUGIN_CACHE_V2_S3_BUCKET}/${TKEY}"
  BK_AWS_FOUND=false

  aws s3api head-object --bucket "${BUILDKITE_PLUGIN_CACHE_V2_S3_BUCKET}" --key "${TKEY}/${TAR_FILE}" $BK_AWS_ARGS || no_head=true

  if ${no_head:-false}; then
    # Check `jq` first
    if command -v jq &>/dev/null; then
      # Now, lets try one of the restore keys...
      if [ "${#keys[@]}" -gt 0 ]; then
        for key in "${keys[@]}"; do
          key="$(expand_templates "${key}")"
          echo -e "${BK_LOG_PREFIX}🔍 Looking using restore-key: ${key}"
          PKEY=$(aws s3api list-objects --bucket "${BUILDKITE_PLUGIN_CACHE_V2_S3_BUCKET}" $BK_AWS_ARGS --prefix="${TKEY}/${key}" --query 'Contents[].{Key: Key, LastModified: LastModified}' | jq 'try(. |= sort_by(.LastModified)  |  first(reverse[]) | .["Key"]) catch "NULL"')
          PKEY="${PKEY%\"}"
          PKEY="${PKEY#\"}"
          if [ "${PKEY}" == "NULL" ]; then
            continue
          else
            # Actually, we can use PKEY as-is. But we still need the only last part of the key.
            TAR_FILE="${PKEY##*/}"
            BK_AWS_FOUND=true
            cache_hit "s3://${BUCKET}/${TAR_FILE} by using restore key: ${key}"
            break
          fi
        done
      fi
    else
      error "'jq' command not found. 'restore-keys' will be discarded."
    fi
  else
    BK_AWS_FOUND=true
    cache_hit "s3://${BUCKET}/${TAR_FILE}"
  fi

  if [[ ! "${BK_AWS_FOUND}" =~ (false) ]]; then
    aws s3 cp $BK_AWS_ARGS "s3://${BUCKET}/${TAR_FILE}" .
    tar ${BK_TAR_EXTRACT_ARGS} "${TAR_FILE}" -C .
  else
    cache_restore_skip "s3://${BUCKET}/${TAR_FILE}"
  fi
}

function cache() {
  TAR_FILE="${CACHE_KEY}.${BK_TAR_EXTENSION}"
  BUCKET="${BUILDKITE_PLUGIN_CACHE_V2_S3_BUCKET}/${BUILDKITE_ORGANIZATION_SLUG}/${BUILDKITE_PIPELINE_SLUG}"
  TAR_TARGETS=""

  if [ "${#paths[@]}" -eq 1 ]; then
    TAR_TARGETS="${paths[*]}"
  elif
    [ "${#paths[@]}" -gt 1 ]
  then
    TAR_TARGETS="${paths[@]}"
  fi

  cache_locating "${TAR_TARGETS}"
  TAR_FILE="${CACHE_KEY}.${BK_TAR_EXTENSION}"

  # allow the option to force the update of the cache, by the 'always-update' flag
  # in other words, even if the cache was found, it will be updated
  # this is useful for scheduled builds that ensures the cache is always up to date
  if [ ! -f "$TAR_FILE" ] || [ "${BUILDKITE_PLUGIN_CACHE_V2_ALWAYS_CACHE:-false}" == "true" ]; then
    if [ ! -f "$TAR_FILE" ]; then
      echo -e "${TAR_FILE} Cache uploaded since no previous cache was found."
    else
      echo -e "${TAR_FILE} Cache was found, but cache generation is FORCED because 'always-cache' setting is enabled."
      rm -f "${TAR_FILE}"
    fi
    TMP_FILE="/tmp/cache_target.tar"
    tar -cf "${TMP_FILE}" ${TAR_TARGETS}
    mv -f "${TMP_FILE}" "${TAR_FILE}"
    aws s3 cp $BK_AWS_ARGS "$TAR_FILE" "s3://${BUCKET}/${TAR_FILE}"
  fi
  rm -f "${TAR_FILE}"
}
