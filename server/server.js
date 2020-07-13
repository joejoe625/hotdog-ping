const _ = require('lodash');

// ***
// Create logger
// ***
const pino = require('pino');
const expressPino = require('express-pino-logger');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

// ***
// Read service configuration
// ***
const config = require('../config//config.json');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);
global.gConfig = finalConfig;


// ***
// Set up app
// ***
const { resolve } = require("path");
const express = require('express')
const app = express()
app.use(express.static('.')); 
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(expressLogger);


const port = global.gConfig.node_port
const publishable_key =  global.gConfig.publishable_key
const secret_key = global.gConfig.secret_key
const stripe = require('stripe')(secret_key);

// *** 
// register webhook
// ***
app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
  let event;

  try {
    event = JSON.parse(request.body);
  } catch (err) {
  	response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.log('PaymentIntent was successful!');
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      logger.log('PaymentMethod was attached to a Customer!');
      break;
    case 'charge.succeeded':
      const charge = event.data.object;
      logger.log('charge succeeded ! ' + charge);
      break;
    case 'payment_intent.created':
      const intent = event.data.object;
      logger.log('payment intent created! ' + intent);
      break;
    // ... handle other event types
    default:
      // Unexpected event type
      return response.status(400).end();
  }

  // Return a 200 response to acknowledge receipt of the event
  response.json({received: true});

});

// *** 
// register checkout page
// ***
app.get("/checkout", (req, res) => {
  // Display checkout page
  const path = resolve("./client/checkout.html");
  res.sendFile(path);
});

// ***
// calucate order amount
// ***
const calculateOrderAmount = items => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 5000;
};

// ***
// create description for items
// for the sake of testing purpose, just hardcode description to 'photo'
// ***
const createDescriptionForItems = items => {
	// Create transaction description for items
	return "photo"
}

// ***
// create payment intent
// ***
app.post("/create-payment-intent", async (req, res) => {

  // retieve items and currency from rerquest body
  const { items, currency } = req.body;

  // read shipping address from order 
  const shippingAddress = {
    name: 'Jenny Rosen',
    address: {
      line1: '1234 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postal_code: '94111',
    }
  };

  const intentObject = {
    description: createDescriptionForItems(items),
    amount: calculateOrderAmount(items),
    currency: currency,
    metadata: {integration_check: 'accept_a_payment'},
    // payment_method_types: ['card'],
    // receipt_email: 'anerky2002@gmail.com',
    // setup_future_usage: 'off_session',
    // customer: customer.id,
    // customer: 'cus_HdBk7amVyBekrA',
    // confirm: 'true',
    // payment_method: 'pm_1H3vNbHMgrROy87IJyWRa9lp',
    shipping: shippingAddress,
    }

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create(intentObject);

  logger.info(`Payment intent is created ${JSON.stringify(paymentIntent)}`)

  // Send publishable key and PaymentIntent details to client
  res.send({
    publishableKey: publishable_key,
    clientSecret: paymentIntent.client_secret
  });
});

app.get("/get-all-payment-intents", async (req, res) => {
  var history = []
  var response = await stripe.paymentIntents.list({limit:100});
  data = response.data
  history = history.concat(data)
  while (response.has_more) {
    response = await stripe.paymentIntents.list({limit:100, starting_after:data[data.length - 1].id})
    history = history.concat(response.data)
  }
  if (history.length > 0) {
    res.send(history)
  }
  else{
    res.send('no payment intents')
  }
})

app.listen(port, () => logger.info(`E-commerce app listening at http://localhost:${port}`))