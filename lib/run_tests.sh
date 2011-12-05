#!/bin/bash

file=$1

if [ "$file" == "" ]; then
  file="*"
fi

find ./tests -name "$file.js" -exec node {} \;
