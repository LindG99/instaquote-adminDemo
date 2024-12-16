import type { Actions, PageServerLoad } from './$types'
import { fail } from '@sveltejs/kit'
import { z } from "zod";

//Schema for register new data
const materialSchema = z.object({
    name: z
    .string( { required_error: 'Namn får inte vara tomt'})
    .min(1, { message: 'Namn får inte vara mindre än 1 tecken'})
    .max(64, { message: 'Namn får inte vara mer än 64tecken'})
    .trim(),
    type: z
    .string({ required_error: 'Typ får inte vara tomt'})
    .min(1, { message: 'Typ får inte vara mindre än 1 tecken'})
    .max(64, { message: 'Typ får inte vara mer än 64tecken'})
    .trim(),
    cost_per_kg_in_kr: z
    .number({ invalid_type_error: 'Kostnad måste ha ett värde' })
    .refine(val => !isNaN(val), {
        message: "Kostnad måste vara ett positivt nummer."
      }),
    density_in_kg_per_cubic_meter: z
    .number({ invalid_type_error: 'Densitet måste ha ett värde'})
    .refine(val => !isNaN(val), {
        message: "Kostnad måste vara ett positivt nummer."
      }),
      supplier_id: z
      .number({ required_error: 'Supplier Id får inte vara tomt' }) 
      .int({ message: 'Supplier Id måste vara ett heltal' })  
      .positive({ message: 'Supplier Id måste vara ett positivt heltal' }) 
      .min(1, { message: 'Supplier Id måste vara större än 0' })
 });
 //Schema for validation from database to browser.
 const loadMaterialSchema = z.object({
    material_id: z
        .number({ invalid_type_error: 'Material ID måste vara ett nummer' })
        .int({ message: 'Material ID måste vara ett heltal' })
        .positive({ message: 'Material ID måste vara ett positivt tal' }),
    name: z
        .string({ required_error: 'Namn får inte vara tomt' })
        .min(1, { message: 'Namn får inte vara mindre än 1 tecken' })
        .max(64, { message: 'Namn får inte vara mer än 64 tecken' })
        .trim(),
    type: z
        .string({ required_error: 'Typ får inte vara tomt' })
        .min(1, { message: 'Typ får inte vara mindre än 1 tecken' })
        .max(64, { message: 'Typ får inte vara mer än 64 tecken' })
        .trim(),
    cost_per_kg_in_kr: z
        .number({ invalid_type_error: 'Kostnad måste vara ett nummer' })
        .positive({ message: 'Kostnaden måste vara ett positivt tal' }),
    density_in_kg_per_cubic_meter: z
        .number({ invalid_type_error: 'Densitet måste vara ett nummer' })
        .positive({ message: 'Densitet måste vara ett positivt tal' }),
    supplier_id: z
        .number({ invalid_type_error: 'Leverantörs-ID måste vara ett nummer' })
        .int({ message: 'Leverantörs-ID måste vara ett heltal' })
        .positive({ message: 'Leverantörs-ID måste vara ett positivt heltal' })
});

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
  try {
    const validatedMaterials = materials?.map(material => loadMaterialSchema.parse(material));
    console.log("Successfully loaded materials");
    return { materials: validatedMaterials ?? [] };
} catch (err) {
    console.error('Error validating materials:', err);
    return { materials: materials ?? [] }
    }
} 

// Actions, add materials, remove materials, edit materials
export const actions: Actions = {
    // Add new materials with zod validation
    addMaterial: async ({ request, locals: { supabase } }) => {
        const formData = Object.fromEntries(await request.formData());
    
        // "Convert the numeric fields to numbers"
        const parsedData = {
            name: formData.name,
            type: formData.type,
            cost_per_kg_in_kr: parseFloat(formData.cost_per_kg_in_kr as string),
            density_in_kg_per_cubic_meter: parseFloat(formData.density_in_kg_per_cubic_meter as string),
            supplier_id: parseInt(formData.supplier_id as string),  // convert to number
        };
    
        // Validate formData with Zod
        try {
            const result = materialSchema.parse(parsedData);
            console.log('SUCCESS');
            console.log(result); 
    
            const { name, type, cost_per_kg_in_kr, density_in_kg_per_cubic_meter, supplier_id } = result;
    
            // try adding data to the database
            const { error } = await supabase
                .from('material')
                .insert({ name, type, cost_per_kg_in_kr, density_in_kg_per_cubic_meter, supplier_id });
    
            if (error) {
                return fail(500, { success: false, message: error.message });
            }
            return { success: true, message: 'Material har lagts till.' };

            //catch the error and return it so we can call it in frontend
        } catch (err) {
            if (err instanceof z.ZodError) {
                const { fieldErrors: errors } = err.flatten();
                const { name, type, ...rest } = formData;
                return {
                    data: rest,
                    errors
                };
            }
            // return error message
            return fail(400, {
                success: false,
                message: "Validering misslyckades.",
            });
        }
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
    // Edit material with zod validation
    editMaterial: async ({ request, locals: { supabase } }) => { 0

        const formData = Object.fromEntries(await request.formData());

        const parsedData = {
            material_id: formData.material_id,
            name: formData.name,
            type: formData.type,
            cost_per_kg_in_kr: parseFloat(formData.cost_per_kg_in_kr as string),
            density_in_kg_per_cubic_meter: parseFloat(formData.density_in_kg_per_cubic_meter as string),
            supplier_id: parseInt(formData.supplier_id as string),
        };

        try {
            const result = materialSchema.parse(parsedData);
            console.log('SUCCESS', result); 

        //updates data
            const {error} = await  supabase
                .from ('material')
                .update({
                    name: result.name,
                    type: result.type,
                    cost_per_kg_in_kr: result.cost_per_kg_in_kr,
                    density_in_kg_per_cubic_meter: result.density_in_kg_per_cubic_meter,
                    supplier_id: result.supplier_id,
                })
                .eq ('material_id', parsedData.material_id); //paresedData becuase the material_id is not in materialSchema and should't be editable

            //Error checking
            if (error) {
                return fail(500, { success: false, message: error.message });
            }

        }catch (err) {
            if (err instanceof z.ZodError) {
                const { fieldErrors: errors } = err.flatten();
                const { name, type, ...rest } = formData;
                return {
                    data: rest,
                    errors
                };
            }
            // return error message
            return fail(400, {
                success: false,
                message: "Validering misslyckades.",
            });
        }
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