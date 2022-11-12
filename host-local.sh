#!/usr/bin/bash

# run this script from the root directory of the repository

PORT=8888
docker run --rm -d --name="jonasmusall.github.io" -v $(pwd)/_site:/usr/share/nginx/html -p $PORT:80 nginx
echo "http://localhost:$PORT"
