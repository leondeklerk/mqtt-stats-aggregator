# Tasmota MQTT stats aggregator

Runs a daily function to retrieve statistics for configured Tasmota MQTT devices and stores these.
Mainly intended to gain insight into daily energy usage, but does not have any data processing/graphing yet.

It pulls the data from all configured devices at midnight every day. The data is written to files in CSV format `date,usage` where both values point to the day before (e.g. on 1/1/2023 it gets the data of 31/12/2022). After a response has been received for each configured topic, the client will disconnect until the next polling moment.

## Environment variables

All environment variables are optional and can be left out. By default, the connection is made to `localhost:1883`.

The following environment variables can be configured:

```env
MQTT_PASSWORD="admin"
MQTT_USERNAME="admin"
MQTT_HOST="localhost"
MQTT_PORT="1883"
# File name of the CA file that self-signed the broker cert in pem format.
MQTT_CA_FILE="ca.pem"
MQTT_PROTOCOL="mqtts"
# comma-separated string of device topics.
MQTT_TOPICS="device1,device2"
MQTT_TZ="Europe/Amsterdam"
```

## File structure

Each device defined via the `MQTT_TOPICS` variable will create its own file where data is stored. For example, a device with the topic `device1` will create a `device1` file. If a response is received containing a topic that is not configured, it will be placed in a file called `fallback`. The CSV format of this file is `date,topic,usage`.

The files are stored in the `data` folder (`/app/data` binding with Docker).
The optional CA file must be placed in the `config` folder (`/app/config` binding with Docker)
