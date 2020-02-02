#!/bin/bash

echo ******************************************************
echo Starting the replica set
echo ******************************************************

sleep 70 | echo Sleeping
mongo mongodb://mongo-0.mongo:27017 replicaSet.js
