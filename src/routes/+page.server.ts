import { materialSchema, materialWithIdSchema } from '$lib';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

//Get data
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: materials, error } = await supabase.from('material').select();
	//selecting all data from the materials

	if (error) {
		console.error('Error fetching materials:', error.message);
		return { materials: [] };
	}
	try {
		const validatedMaterials = materials?.map((material) => materialWithIdSchema.parse(material));
		console.log('Successfully loaded materials');
		return { materials: validatedMaterials ?? [] };
	} catch (err) {
		console.error('Error validating materials:', err);
		return { materials: materials ?? [] };
	}
};

// Actions, add materials, remove materials, edit materials
export const actions: Actions = {
	// Add new materials with zod validation
	addMaterial: async ({ request, locals: { supabase } }) => {
		const formData = Object.fromEntries(await request.formData());

		const result = materialSchema.safeParse(formData);

		if (result.success === false) {
			console.log(result.error);
			console.log(result.error.flatten());
			const { fieldErrors: errors } = result.error.flatten();
			// const { name, type, ...rest } = formData;
			return {
				data: formData,
				errors
			};
		}

		console.log('SUCCESS');
		console.log(result);

		// try adding data to the database
		const { error } = await supabase.from('material').insert(result.data);

		if (error) {
			return fail(500, { success: false, message: error.message });
		}
		return { success: true, message: 'Material har lagts till.' };
	},

	// Remove material
	removeMaterial: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const material_id = formData.get('material_id');

		if (!material_id) {
			return fail(400, { success: false, message: ' Material för ID saknas!' });
		}

		const { error } = await supabase.from('material').delete().eq('material_id', material_id);

		if (error) {
			return fail(500, { success: false, message: error.message });
		}
		return { success: true, message: 'Material har tagits bort!' };
	},
	// Edit material with zod validation
	editMaterial: async ({ request, locals: { supabase } }) => {
		const formData = Object.fromEntries(await request.formData());

		const result = materialWithIdSchema.safeParse(formData);
		console.log('result ');
		if (result.success === false) {
			console.log(result.error);
			console.log(result.error.flatten());
			const { fieldErrors: errors } = result.error.flatten();
			const { name, type, ...rest } = formData;
			return {
				data: rest,
				errors
			};
		}
		console.log('SUCCESS', result);

		//updates data
		console.log('before supabase');
		const { error } = await supabase
			.from('material')
			.update(result.data)
			.eq('material_id', result.data.material_id); //paresedData becuase the material_id is not in materialSchema and should't be editable
		console.log('after supabase');

		//Error checking
		if (error) {
			return fail(500, { success: false, message: error.message });
		}
	}
};
