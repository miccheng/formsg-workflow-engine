#!/bin/bash

docker run -it -e NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN} ngrok/ngrok:latest http host.docker.internal:3000