import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Hämta alla material
export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  // Hämta alla material från databasen
  const { data, error } = await supabase.from('material').select('*');

  if (error) {
      return new Response(JSON.stringify({ success: false, message: error.message }), {
          status: 500,
      });
  }

  return json({ success: true, materials: data });
}; 

//skapa material
export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const cost_per_kg_in_kr = parseFloat(formData.get('cost_per_kg_in_kr') as string);
  const density_in_kg_per_cubic_meter = parseFloat(formData.get('density_in_kg_per_cubic_meter') as string);
  const supplier_id = parseInt(formData.get('supplier_id') as string, 10);

  // Kontrollera att fält är fyllda
  if (!name || !type || isNaN(cost_per_kg_in_kr) || isNaN(density_in_kg_per_cubic_meter) || isNaN(supplier_id)) {
    return new Response(JSON.stringify({ success: false, message: 'Alla fält måste fyllas i korrekt.' }), {
      status: 400,
    });
  }

  // Lägg till nytt material i Supabase
  const { data, error } = await supabase
    .from('material')
    .insert([
      { name, type, cost_per_kg_in_kr, density_in_kg_per_cubic_meter, supplier_id },
    ])
    .select();

   console.log('Supabase response data:', data); // Här loggar vi data

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, message: 'Materialet har lagts till', data }), {
    status: 201,
  });
};

//Ta bort material
export const DELETE: RequestHandler = async ({ request, locals: { supabase } }) => {
  const { material_id } = await request.json();
  console.log("Received id on server:", material_id); // Logga id för att se vad servern får
  
  if (!material_id) {
    return new Response(JSON.stringify({ success: false, message: 'Material för ID saknas.' }), { status: 400 });
  }
  const { error } = await supabase
  .from('material')
  .delete()
  .eq('material_id', material_id);
  
  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, message: 'Materialen har tagits bort' }), {
    status: 200,
  });
};

// Redigera material
export const PUT: RequestHandler = async ({ request, locals: { supabase } }) => {
  const formData = await request.formData();
  const material_id = formData.get('material_id') as string; // Hämta materialets ID
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const cost_per_kg_in_kr = parseFloat(formData.get('cost_per_kg_in_kr') as string);
  const density_in_kg_per_cubic_meter = parseFloat(formData.get('density_in_kg_per_cubic_meter') as string);
  const supplier_id = parseInt(formData.get('supplier_id') as string, 10);

  // Kontrollera att fält är fyllda
  if (!material_id || !name || !type || isNaN(cost_per_kg_in_kr) || isNaN(density_in_kg_per_cubic_meter) || isNaN(supplier_id)) {
    return new Response(JSON.stringify({ success: false, message: 'Alla fält måste fyllas i korrekt.' }), {
      status: 400,
    });
  }

  // Uppdatera materialet i Supabase
  const { data, error } = await supabase
    .from('material')
    .update({ name, type, cost_per_kg_in_kr, density_in_kg_per_cubic_meter, supplier_id })
    .eq('material_id', material_id); // Använd materialets ID för att identifiera vilket material som ska uppdateras

  if (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, message: 'Materialet har uppdaterats', data }), {
    status: 200,
  });
};
