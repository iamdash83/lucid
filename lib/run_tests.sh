#!/bin/bash

file=$1

if [ "$file" == "" ]; then
  file="*"
fi

files=$(find ./test -name "$file.js")
count=$(echo $files | wc -l)
count=$(($count+1))
j=1
passed=0
failed=0
errors=0

for i in $files 
do
  if [ "$j" != 1 ]; then
    echo ''
  fi
  echo "Running test $j out of $count total - file: $i" 
  j=$(($j+1))
  res=`node $i`
  passed=$(($passed + $(echo "$res" | tail -1 | grep -o "Passed:[0-9]" | tr -d 'A-Za-z:')))
  failed=$(($failed + $(echo "$res" | tail -1 | grep -o "Failed:[0-9]" | tr -d 'A-Za-z:')))
  errors=$(($errors + $(echo "$res" | tail -1 | grep -o "Errors:[0-9]" | tr -d 'A-Za-z:')))
  echo "$res"
done

echo "Total passed: $passed
Total failed: $failed
Total errors: $errors"
