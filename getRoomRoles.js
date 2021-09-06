import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { settings } from '../../../settings';
import { getRoomRoles } from '../lib/getRoomRoles';


const { NodeTracerProvider } = require('@opentelemetry/node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';


export const SERVICE_NAME = 'tchat-server';

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  }),
});

const exporterOptions = {
	endpoint: 'http://jaeger:14268/api/traces',
}

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(new JaegerExporter(exporterOptions)));

provider.register();

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations()
  ],
});


Meteor.methods({
	getRoomRoles(rid) {
		check(rid, String);

		if (!Meteor.userId() && settings.get('Accounts_AllowAnonymousRead') === false) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getRoomRoles' });
		}

		check(rid, String);

		return getRoomRoles(rid);
	},
});
