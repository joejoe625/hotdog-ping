## Description

This project is created for a Stripe PM interview which focuses on the [Stripe PaymentIntent integration](https://stripe.com/docs/payments/accept-a-payment#web). It contains a _client_ and _server_ component.

* The _client_ was bootstrapped with Node & Create React App, and then built for checkout of a one-time purchase following the [client-side instructions](https://stripe.com/docs/payments/accept-a-payment#web).

* The _server_ originated from [Stripe's node webhooks example implementation](https://github.com/stripe-samples/accept-a-card-payment), then modified for this exercise.

* The application is configured to run locally; there are no deploy instructions at this time.


## Prerequisites
This instruction assumes you have a Mac environment. This has been tested on Mac OS 10.15.5.


* git 
```bash
brew install git
```

* Node
```bash
brew install node
```

* Strip CLI
```bash
brew install stripe/stripe-cli/stripe
```

## Installation

```bash
git clone git@github.com:joejoe625/hotdog-ping.git
cd hotdog-ping.git
npm install
```

## Create new stripe account
* Go to https://stripe.com to create a new account
* Follow the instructions here to obtain [API Keys](https://stripe.com/docs/development#api-keys)
* Update the secret key and publish key in config/config.json

## Launch service from your local machine

```bash
node server/server.js
``` 

The following logs should show and your service should be alive to serve traffic.
```bash
E-commerce app listening at http://localhost:3000
```

## Testing
* Go to http://localhost:3000/checkout to test [scenarios](https://stripe.com/docs/payments/accept-a-payment#web-test-integration)


* Get all payment intents via 
http://localhost:3000/get-all-payment-intents


* Test webhook 
	- open a new tab in the terminal, run
		```bash
		stripe listen --forward-to http://localhost:3000/webhook
		``` 
	- open a new tab in the terminal, run
		```bash
		stripe trigger payment_intent.succeeded
```
	- expect the following response
		```bash
		2020-07-12 18:42:30   --> charge.succeeded [evt_1H4GgbHMgrROy87IukxbEp4G]
		2020-07-12 18:42:30  <--  [200] POST http://localhost:3000/webhook [evt_1H4GgbHMgrROy87IukxbEp4G]
		2020-07-12 18:42:30   --> payment_intent.created [evt_1H4GgbHMgrROy87IOkAXpLRj]
		2020-07-12 18:42:30  <--  [200] POST http://localhost:3000/webhook [evt_1H4GgbHMgrROy87IOkAXpLRj]
		2020-07-12 18:42:30   --> payment_intent.succeeded [evt_1H4GgbHMgrROy87IPZdmAukS]
		2020-07-12 18:42:30  <--  [200] POST http://localhost:3000/webhook [evt_1H4GgbHMgrROy87IPZdmAukS]
		```

