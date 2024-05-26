#!/bin/bash
export IMAGE_TAG=eth
podman build -t satsbridge:$IMAGE_TAG . &&
podman tag localhost/satsbridge:$IMAGE_TAG docker.io/ievdokimov/satsbridge:$IMAGE_TAG &&
podman push docker.io/ievdokimov/satsbridge:$IMAGE_TAG
