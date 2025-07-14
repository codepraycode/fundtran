import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('refresh_tokens', (table) => {
		// Primary Key
		table.increments('id').primary();

		// Required Fields
		table.string('token', 512).notNullable().unique();
		table.integer('user_id').unsigned().notNullable();
		table.timestamp('expires_at').notNullable();

		// Metadata
		table.string('user_agent', 512).nullable();
		table.string('ip_address', 45).nullable(); // IPv6 compatible

		// Timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now());

		// Foreign Key
		table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE'); // Delete tokens when user is deleted

		// Indexes
		table.index(['token'], 'idx_refresh_tokens_token');
		table.index(['user_id'], 'idx_refresh_tokens_user_id');
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('refresh_tokens');
}
