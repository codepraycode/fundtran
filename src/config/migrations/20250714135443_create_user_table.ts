import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('users', (table) => {
		// Primary Key
		table.increments('id').primary();

		// Required Fields
		table.string('first_name', 50).notNullable();
		table.string('last_name', 50).notNullable();
		table.string('email', 255).notNullable().unique();
		table.string('password', 255).notNullable();
		table.string('phone', 20).notNullable().unique();

		// Timestamps
		table.timestamp('created_at').defaultTo(knex.fn.now());
		table
			.timestamp('updated_at')
			.defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

		// Optional Fields
		table.boolean('is_verified').defaultTo(false);
		table.string('verification_token', 255).nullable().unique();
		table.timestamp('last_login').nullable();

		// Indexes
		table.index(['email'], 'idx_users_email');
		table.index(['phone'], 'idx_users_phone');
		table.index(['verification_token'], 'idx_users_verification_token');

		// For soft delete (optional)
		table.timestamp('deleted_at').nullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('users');
}
