<script lang="ts">
	import { updated } from "$app/stores";
  import { onMount } from "svelte";
  
  let showAddMaterialForm = false; 
  
  export let data: { materials: any[] }; 
  let materials = [...data.materials];
  $: materials = [...data.materials];

    
  let newMaterial = {
      name: '',
      type: '',
      cost_per_kg_in_kr: '',
      density_in_kg_per_cubic_meter: '',
      supplier_id: ''
  };
   
  onMount(async () => {
     await loadMaterials();
   });

  //Ladda material
   const loadMaterials = async () => {
    const response = await fetch('/materials', { method: 'GET'});
    const result = await response.json();
    materials = result.materials ?? [];
  };

  //Lägg till material
  const addMaterial = async () => {
    const costPerKg = parseFloat(newMaterial.cost_per_kg_in_kr);
    const density = parseFloat(newMaterial.density_in_kg_per_cubic_meter);

    if (isNaN(costPerKg) || isNaN(density)) {
        alert('Vänligen ange giltiga numeriska värden.');
        return;
    }

      const response = await fetch('/materials', { /* Ändra path senare */
        method: 'POST',
        body: new URLSearchParams({
          'name': newMaterial.name,
          'type': newMaterial.type,
          'cost_per_kg_in_kr': costPerKg.toString(),
          'density_in_kg_per_cubic_meter': density.toString(),
          'supplier_id': newMaterial.supplier_id.toString()
        })
      });
  
      const result = await response.json();
      
      if (result.success) {
        if (result.data && result.data.length > 0) {
        materials = [...materials, result.data[0]];  // Lägg till första objektet i arrayen
        newMaterial = { name: '', type: '', cost_per_kg_in_kr: '', density_in_kg_per_cubic_meter: '', supplier_id: '' };
        } else {
        // Ingen data returnerades, du kan logga ett meddelande utan att kasta ett error
        alert('Materialet skapades, men inget resultat returnerades.');
    }
      } else {
        alert(`Error: ${result.message}`);
      }
  };

  // Redigera material
  type Material = {
        material_id: string; // or number
        name: string;
        type: string;
        cost_per_kg_in_kr: number;
        density_in_kg_per_cubic_meter: number;
        supplier_id: string;
  };

  let editModal: HTMLDivElement | null = null;
  let editingMaterial: Material | null = null; // Håller reda på vilket material som redigeras
  let isEditModalVisible = false; // Kontrollera modals synlighet.
  

  const openEditModal = (material: Material) => {
      editingMaterial = { ...material };
      isEditModalVisible = true; //Visa model
  };

  const closeEditModal = () => {
    editingMaterial = null;
      isEditModalVisible = false; //Stäng model.
  };

  const saveEditedMaterial = async (event: SubmitEvent) => {

    if (!editingMaterial) {
      alert('Inget material att spara.');
      return; // Stoppa om inget material redigeras
    }

    try {

      const response = await fetch('/materials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          material_id: editingMaterial.material_id,
          name: editingMaterial.name,
          type: editingMaterial.type,
          cost_per_kg_in_kr: editingMaterial.cost_per_kg_in_kr.toString(),
          density_in_kg_per_cubic_meter: editingMaterial.density_in_kg_per_cubic_meter.toString(),
          supplier_id: editingMaterial.supplier_id.toString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadMaterials(); // Ladda om alla material efter uppdatering
        editingMaterial = null; // Rensa redigeringsobjektet
      } else {
        alert(`Fel vid uppdatering: ${result.message}`);
      }
    } catch (error) {
      alert('Ett fel inträffade vid uppdatering av materialet.');
      console.error(error);
    }
  };
  //Här slutar redigera material
  
  // Radera material
  const deleteMaterial = async (material_id: string) => {
      const response = await fetch(`/materials`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ material_id })
      });

      const result = await response.json();
      if (result.success) {
        await loadMaterials();  // Ladda om alla material från backend
        materials = materials.filter(material => material._id !== material_id); 
      } else {
        console.error(result.message);
      }
  };
  </script>
  
  <style>
    .container {
    max-width: 1500px; 
    margin: auto; 
    padding: 20px; 
    }

    .modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center; /* Centrera horisontellt */
  align-items: center;    /* Centrera vertikalt */
  background-color: rgba(0, 0, 0, 0.5); /* Halvtransparent bakgrund */
  z-index: 1000; /* Säkerställ att modalen är ovanpå allt annat */
  opacity: 0; /* Gör den osynlig som standard */
  pointer-events: none; /* Blockera interaktion när inte synlig */
  transition: opacity 0.3s ease;
}

.modal.show {
  opacity: 1;
  pointer-events: auto; /* Tillåt interaktion */
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 20px;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }

  .modal-content input {
    width: 100%;
    margin: 10px 0;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .modal-content button {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .modal-content button:hover {
    background-color: #0056b3;
  }

    .dashboard {
      display: flex;
      flex-direction: column; 
      align-items: center; 
      padding: 20px; 
    }
  
    h1 {
      margin-bottom: 10px;
      text-align: center;
      color: #333;
    }
  
    .search-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
  
    .search-box {
      padding: 5px;
      font-size: 14px;
      width: 300px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
  
    th, td {
      padding: 10px;
      text-align: left;
      border: 1px solid #ddd;
    }
  
    th {
      background-color: #f4f4f4;
      color: #333;
    }
  
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  
    .actions {
      text-align: center;
    }
  
    .add-btn {
      background-color: #007BFF;
      color: white;
      margin-top: 10px;
      padding: 10px 15px;
      text-align: center;
      border-radius: 5px;
      text-decoration: none;
      display: inline-block;
    }
  
  .form-container {
      max-width: 500px; 
    margin: 0 auto; 
    padding: 20px; 
    border: 1px solid #ddd; 
    border-radius: 5px; 
    background-color: #f9f9f9;
    }
  
  .form-container input {
    width: 100%; 
    max-width: 400px; 
    padding: 10px; 
    margin-bottom: 15px; 
    border: 1px solid #ccc;
    border-radius: 5px; 
    }
  
  .button-group {
    display: flex; 
    justify-content: space-between; 
    margin-top: 20px; 
}

  .button-group button {
        background-color: #007BFF; /* Bakgrundsfärg för knapparna */
        color: white; /* Textfärg */
        padding: 10px 15px; /* Padding för att göra knapparna större */
        border: none; /* Ta bort standardram */
        border-radius: 5px; /* Rundade hörn */
        cursor: pointer; /* Ändra muspekaren till en hand */
        transition: background-color 0.3s; /* Lägg till en övergångseffekt */
        flex: 1; /* Gör knapparna lika breda */
        margin-right: 10px; /* Lägg till marginal mellan knapparna */
    }

  .button-group button:last-child {
        margin-right: 0; /* Ta bort marginalen på den sista knappen */
    }

  .button-group button:hover {
        background-color: #0056b3; /* Mörkare färg vid hover */
    }
  @media (max-width: 600px) {
    .container {
      padding: 10px; /* Minska padding på mindre skärmar */
   }

    .form-container {
      width: 100%; /* Gör formuläret fullt brett på små skärmar */
   }
}

  </style>
  
  <!-- HTML for Dashboard material -->
  <div class="container"> 
  <div class="dashboard">
    <h1>Material Admin Dashboard</h1>
    
    <!-- Search Box -->
    <div class="search-container">
      <input 
        type="text" 
        placeholder="Search materials..." 
        class="search-box" 
      />
    </div>
  
    <!-- Material Table -->
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Cost per kg (kr)</th>
      <th>Density (kg/m³)</th>
      <th>Supplier ID</th>
      <th class="actions">Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each materials as material}
      <tr>
        <td>{material.name}</td>
        <td>{material.type}</td>
        <td>{material.cost_per_kg_in_kr}</td>
        <td>{material.density_in_kg_per_cubic_meter}</td>
        <td>{material.supplier_id}</td>
        <td class="actions">
          <!-- Edit button -->
          <button on:click={() => openEditModal(material)}>Redigera</button>
          <button on:click={() => deleteMaterial(material.material_id)}>Ta bort</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
  </div>
  
<!-- Lägg till ny Material Button -->
<a href="javascript:void(0)" class="add-btn" on:click={() => showAddMaterialForm = true}>Lägg in nytt material</a>

<!-- Redigera existerande material -->
<div class="modal {isEditModalVisible ? 'show' : ''}" bind:this={editModal}>
  <div class="modal-content">
    <div class="modal-header">
      <h2>Redigera material</h2>
      <button class="modal-close" on:click={closeEditModal}>&times;</button>
    </div>
    {#if editingMaterial}
      <form on:submit|preventDefault={saveEditedMaterial}>
        <input type="text" placeholder="Name" bind:value={editingMaterial.name} />
        <input type="text" placeholder="Type" bind:value={editingMaterial.type} />
        <input type="number" placeholder="Cost per kg (kr)" bind:value={editingMaterial.cost_per_kg_in_kr} step="any"/>
        <input type="number" placeholder="Density (kg/m³)" bind:value={editingMaterial.density_in_kg_per_cubic_meter} step="any"/>
        <input type="text" placeholder="Supplier ID" bind:value={editingMaterial.supplier_id} />
        <button type="submit">Spara</button>
      </form>
    {/if}
  </div>
</div>
    
{#if showAddMaterialForm}
  <!-- Skapa ny material -->
  <div class="form-container">
    <h2>Skapa nytt material</h2>
    <form on:submit|preventDefault={addMaterial}>
      <input type="text" placeholder="Name" bind:value={newMaterial.name} />
      <input type="text" placeholder="Type" bind:value={newMaterial.type} />
      <input type="text" placeholder="Cost per kg (kr)" bind:value={newMaterial.cost_per_kg_in_kr} />
      <input type="text" placeholder="Density (kg/m³)" bind:value={newMaterial.density_in_kg_per_cubic_meter} />
      <input type="text" placeholder="Supplier ID" bind:value={newMaterial.supplier_id} />
      
      <!-- Knapparna i en container -->
      <div class="button-group">
        <button type="submit">Lägg till material</button>
        <button type="button" on:click={() => showAddMaterialForm = false}>Stäng</button>
      </div>
    </form>
  </div>
  {/if}
</div>
  