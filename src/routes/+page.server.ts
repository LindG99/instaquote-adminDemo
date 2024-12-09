import type { Actions, PageServerLoad } from './$types'


 export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  //Hämta data
  const { data: materials, error } = await supabase
  .from('material')
  .select('material_id, name, type, cost_per_kg_in_kr, density_in_kg_per_cubic_meter, supplier_id')
  /* Ändra här för att hämta mer data. Börjar med bara namn. */ 

  if (error) {
    console.error('Error fetching materials:', error.message)
    return { materials: [] }
  }

  return { materials: materials ?? [] }
} 

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