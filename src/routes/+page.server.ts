import type { Actions, PageServerLoad } from './$types'
import { fail } from '@sveltejs/kit';


//Get data
 export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: materials, error } = await supabase
  .from('material')
  .select()
  //selecting all data from the materials

  if (error) {
    console.error('Error fetching materials:', error.message)
    return { materials: [] }
  }

  return { materials: materials ?? [] }
} 

export const actions: Actions = {
    // Add new materials
    addMaterial: async ({ request, locals: { supabase} }) => {
        const formData = await request.formData();
        const name = formData.get('name');
        const type = formData.get('type');
        const cost_per_kg_in_kr = parseFloat(formData.get('cost_per_kg_in_kr') as string);
        const density_in_kg_per_cubic_meter = formData.get('density_in_kg_per_cubic_meter');
        const supplier_id = formData.get('supplier_id');

        if (!name || !type || !cost_per_kg_in_kr || !density_in_kg_per_cubic_meter || !supplier_id) {
            return fail(400, { success: false, message: 'Alla fält krävs'});
        }

        const {error} = await supabase
        .from('material')
        .insert({ name, type, cost_per_kg_in_kr, density_in_kg_per_cubic_meter, supplier_id });

        if(error){
            return fail(500, { success: false, message: error.message })
        }

        return { success: true, message: 'Material har lagts till.'};
    },
    // Remove material
    removeMaterial: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const material_id = formData.get('material_id');

        if (!material_id) {
            return fail(400, {success: false, message: ' Material för ID saknas!'})
        }

        const { error } = await supabase
        .from('material')
        .delete()
        .eq('material_id', material_id)

        if (error) {
            return fail(500, {success: false, message: error.message });
        }
        return { success: true, message: 'Material har tagits bort!'};
    },
    // Edit material
    editMaterial: async ({ request, locals: { supabase } }) => { 

        const formData = await request.formData();
        const material_id = formData.get('material_id') as string;
        const name = formData.get('name') as string;
        const type = formData.get('type') as string;
        const cost_per_kg_in_kr = parseFloat(formData.get('cost_per_kg_in_kr') as string);
        const density_in_kg_per_cubic_meter = parseFloat(formData.get('density_in_kg_per_cubic_meter') as string);
        const supplier_id = parseInt(formData.get('supplier_id') as string, 10);

        //check value
        if (
            !material_id ||
            !name ||
            !type ||
            isNaN(cost_per_kg_in_kr) ||
            isNaN(density_in_kg_per_cubic_meter) ||
            isNaN(supplier_id)
        )
        {
            return fail(400, { success: false, message: 'Alla fält måste fyllas i korrekt.'});
        }

        //updates data
        const {error} = await  supabase
            .from ('material')
            .update({
                name,
                type,
                cost_per_kg_in_kr,
                density_in_kg_per_cubic_meter,
                supplier_id,
            })
            .eq ('material_id', material_id);
        //Error checking
        if (error) {
            return fail(500, { success: false, message: error.message });
        }
        // Return value and sends message!
        return { success: true, message: 'Materialet har uppdaterats!'}
    }
};























/*// Fortsätter här imorgon. Skapa ny mapp i routes och flyttar över denna metod.
export const actions: Actions = {
    creatematerials: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const type = formData.get('type') as string;
        const cost_per_kg_in_kr = parseFloat(formData.get('cost_per_kg_in_kr') as string);
        const density_in_kg_per_cubic_meter = parseFloat(formData.get('density_in_kg_per_cubic_meter') as string);
        const supplier_id = parseInt(formData.get('supplier_id') as string, 10);

    // kontrollera att fält är fylld
    if (!name || !type || isNaN(cost_per_kg_in_kr) || isNaN(density_in_kg_per_cubic_meter) || isNaN(supplier_id)) {
        return { success: false, message: 'Alla fält måste fyllas i korrekt.' }
    }

    // Lägg till nytt material i supabase
    const { data, error} = await supabase
    .from('material')
    .insert([
        { name, type, cost_per_kg_in_kr, density_in_kg_per_cubic_meter, supplier_id }
        ])
        if (error) {
            return { success: false, message: error.message }
        }

        return { success: true, message: 'Materialen har lagts till', data }
    }
} */