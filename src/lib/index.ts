// place files you want to import through the `$lib` alias in this folder.

import { z } from 'zod';

//Schema for register new data
export const materialSchema = z.object({
	name: z
		.string({ required_error: 'Namn får inte vara tomt' })
		.min(1, { message: 'Namn får inte vara mindre än 1 tecken' })
		.max(64, { message: 'Namn får inte vara mer än 64tecken' })
		.trim(),
	type: z
		.string({ required_error: 'Typ får inte vara tomt' })
		.min(1, { message: 'Typ får inte vara mindre än 1 tecken' })
		.max(64, { message: 'Typ får inte vara mer än 64tecken' })
		.trim(),
	cost_per_kg_in_kr: z.coerce
		.number({ invalid_type_error: 'Kostnad måste ha ett värde' })
		.positive('Kostnad måste vara ett positivt nummer.'),
	density_in_kg_per_cubic_meter: z.coerce
		.number({ invalid_type_error: 'Densitet måste ha ett värde' })
		.positive('Densitet måste vara ett positivt nummer.'),
	supplier_id: z.coerce
		.number({ required_error: 'Supplier Id får inte vara tomt' })
		.int({ message: 'Supplier Id måste vara ett heltal' })
		.positive({ message: 'Supplier Id måste vara ett positivt heltal' })
		.min(1, { message: 'Supplier Id måste vara större än 0' })
});

//Schema for validation from database to browser.
export const materialIdSchema = z.object({
	material_id: z.coerce
		.number({ invalid_type_error: 'Material ID måste vara ett nummer' })
		.int({ message: 'Material ID måste vara ett heltal' })
		.positive({ message: 'Material ID måste vara ett positivt tal' })
});

export const materialPartialSchema = materialSchema.partial();
export type MaterialPartialSchema = z.infer<typeof materialPartialSchema>;
export type MaterialSchema = z.infer<typeof materialSchema>;
export const materialWithIdSchema = materialSchema.merge(materialIdSchema);
export const materialWithIdPartialSchema = materialWithIdSchema.partial();
export type MaterialWithIdSchema = z.infer<typeof materialWithIdSchema>;
export type MaterialWithIdPartialSchema = z.infer<typeof materialWithIdPartialSchema>;
