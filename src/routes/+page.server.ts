import { materialIdSchema, materialSchema, materialWithIdSchema } from '$lib';
import { superForm, superValidate, message } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';


//Get data
export const load: PageServerLoad = async ({ locals: { supabase } }) => {

	const editForm = await superValidate(zod(materialWithIdSchema));
	const createNewForm = await superValidate(zod(materialSchema));
	const removeForm = await superValidate(zod(materialIdSchema))

	const { data: materials, error } = await supabase.from('material').select();
	//selecting all data from the materials

	if (error) {
		console.error('Error fetching materials:', error.message);
		return { removeForm, createNewForm, editForm, materials: [] };
	}
	try {
		const validatedMaterials = materials?.map((material) => materialWithIdSchema.parse(material));
		console.log('Successfully loaded materials');
		return { removeForm, createNewForm, editForm, materials: validatedMaterials ?? [] };
	} catch (err) {
		console.error('Error validating materials:', err);
		return { removeForm, createNewForm, editForm, materials: materials ?? [] };
	}
};

// Actions, add materials, remove materials, edit materials
export const actions: Actions = {
	// Add new materials with zod validation
	addMaterial: async ({ request, locals: { supabase } }) => {
		//const formData = Object.fromEntries(await request.formData());
		const createNewForm = await superValidate(request, zod(materialSchema))

		if (!createNewForm.valid) {
			console.log(createNewForm.errors);
			console.log(createNewForm.data);
			// const { name, type, ...rest } = formData;
			return fail(400, { createNewForm })
		}

		console.log('SUCCESS');
		console.log(materialSchema)

		// try adding data to the database
		const { error } = await supabase.from('material').insert(createNewForm.data);

		if (error) {
			return fail(500, { createNewForm });
		}
		return message(createNewForm, 'Material har skapats!')
	},

	// Remove material
	removeMaterial: async ({ request, locals: { supabase } }) => {
		
		const removeForm = await superValidate(request, zod(materialIdSchema))

		if (!removeForm.valid){
			console.log(removeForm.errors)
			return fail(400, { removeForm, message: 'Valideringsfel uppstod vid borttagning'})
		}
		
		const { material_id } = removeForm.data;
		try {
			// Ta bort material från databasen
			const { error } = await supabase
				.from('material')
				.delete()
				.eq('material_id', material_id);
	
			if (error) {
				console.error(error);
				return fail(500, { removeForm, message: 'Ett fel uppstod vid borttagning av materialet!' });
			}
			return message(removeForm, 'Materialet har tagits bort!');

		} catch (err) {
			console.error(err);
			return fail(500, { removeForm, message: 'Ett oväntat fel inträffade!' });
		}
	},
	// Edit material with zod validation
	editMaterial: async ({ request, locals: { supabase } }) => {


		const editForm = await superValidate(request, zod(materialWithIdSchema))
		

		if (!editForm.valid) {
			console.log(editForm.errors);
			console.log(editForm.data);
			return fail(400, { editForm })
		}

		//updates data
		const { error } = await supabase
			.from('material')
			.update(editForm.data)
			.eq('material_id', editForm.data.material_id);
			console.log(editForm.data.material_id)

		if (error) {
			return fail(500, { editForm });
		}
		return message(editForm, 'Material har redigerats!')
	}
};
