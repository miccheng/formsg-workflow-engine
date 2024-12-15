#!/bin/bash

docker run -it --rm -e NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN} -p 4040:4040 ngrok/ngrok:latest http --url=${NGROK_DOMAIN:-regular-lucky-coral.ngrok-free.app} host.docker.internal:3000