CREATE INDEX `health_metrics_client_metric_date` ON `health_metrics` (`client`,`metric`,`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `wearable_connections_client_provider` ON `wearable_connections` (`client`,`provider`);--> statement-breakpoint
CREATE INDEX `wearable_oauth_states_expires` ON `wearable_oauth_states` (`expires_at`);