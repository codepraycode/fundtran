import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('refresh_tokens', (table) => {
		// Mark tokens as revoked
		table.boolean('is_revoked').defaultTo(false);

		// Track token family for refresh token rotation
		table.string('token_family', 64).notNullable();

		// Add index for faster revocation checks
		table.index(['is_revoked'], 'idx_refresh_tokens_revoked');
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('refresh_tokens', (table) => {
		table.dropColumn('is_revoked');
		table.dropColumn('token_family');
	});
}
