# radar

## Home monitoring tools for raspberry pi & node.js

## Current functionality

* Detects motion
* Takes a photo
* SMS sent with a link to photo
* All activity logged to redis

## TODO

* Web app to take pictures as needed, arm, disarm, 'smart arm' & disarm via identity detection via MAC address
* Remote storage / sync to CouchDB / Dropbox, etc

### Requirements:

* quick2wire-gpio-admin
* onoff
* redis node client
* twilio client
* Twilio account
* Node 6
* redis-server
* Raspberry Pi 3 device
* PIR motion sensor - connected to GPIO 4
* Raspberry Pi camera