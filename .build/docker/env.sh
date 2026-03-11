#!/bin/sh

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

# Add assignment
echo "window._env_ = {" >>./env-config.js

# Read each line in .env file
# Each line represents key=value pairs
while read -r line || [[ -n "$line" ]]; do
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
    # Read value of current variable if exists as Environment variable
    varname1=$varname
    value=$(eval echo \$$varname1)
    # value=$(printf '%s\n' "${!varname}")
    # Otherwise use value from .env file
    [[ -z $value ]] && value=${varvalue}

    # Append configuration property to JS file
    echo "  $varname: \"$value\"," >>./env-config.js
  fi

done <.env.base

echo "}" >>./env-config.js

# -- robots.txt override for non-production environments --
# Only allow crawling on the production domain (https://alkem.io).
# All other environments get a full disallow.
ALKEMIO_DOMAIN=$(printenv VITE_APP_ALKEMIO_DOMAIN || grep '^VITE_APP_ALKEMIO_DOMAIN=' .env.base 2>/dev/null | head -1 | sed 's/^[^=]*=//')
if [ "$ALKEMIO_DOMAIN" != "https://alkem.io" ]; then
  echo "Overriding robots.txt - disallowing all crawlers (domain: ${ALKEMIO_DOMAIN:-unset})"
  cat >./robots.txt <<'EOF'
# Non-production environment - block all crawlers
User-agent: *
Disallow: /
EOF
fi
