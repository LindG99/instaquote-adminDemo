<script lang="ts">
  
	import type { PageData } from "./$types";
  import { enhance } from "$app/forms";
  
  export let data: PageData
  let materials = [...data.materials];
  $: materials = [...data.materials];

  // New material  
  let newMaterial = {
      name: '',
      type: '',
      cost_per_kg_in_kr: '',
      density_in_kg_per_cubic_meter: '',
      supplier_id: ''
  };

  // Edit material
  type Material = {
        material_id: string;
        name: string;
        type: string;
        cost_per_kg_in_kr: number;
        density_in_kg_per_cubic_meter: number;
        supplier_id: string;
  };

  let editMaterial: Material = {
    material_id: '',
    name: '',
    type: '',
    cost_per_kg_in_kr: 0,
    density_in_kg_per_cubic_meter: 0,
    supplier_id: ''
  };

  //views
  let showAddMaterialForm = false; //Add modal view
  let isEditModalVisible = false; // Edit modal view


  const openEditModal = (material: Material) => {
    editMaterial = material;
    isEditModalVisible = true; 
    showAddMaterialForm = false; 
  };

  const openAddMaterial = () => {
    showAddMaterialForm = true;
    isEditModalVisible = false; 
  }

  export let form;
  
</script>
  
<!-- HTML for Dashboard material -->
<div class="container"> 
  <div class="dashboard">
    <h1>Material Admin Dashboard</h1>
    
    <!-- Search Box, no function yet -->
    <div class="search-container">
      <input 
        type="text" 
        placeholder="Search materials..." 
        class="search-box" 
      />
    </div>
  
    <!-- Material Table. -->
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
          <!-- Edit material button -->
          <button class="btn edit-btn" on:click={() => openEditModal(material)}>Redigera</button>
          <!-- Delete Material-->
          <form method="POST" use:enhance action="?/removeMaterial">
            <input type="hidden" name="material_id" value={material.material_id} />
            <button class="btn delete-btn" type="submit">Ta bort</button>
        </form>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
</div>
  
<!-- Add new material button -->
<button class= "add-btn" on:click={openAddMaterial}>Skapa nytt material</button>

{#if isEditModalVisible}
  <!-- Edit material -->
  <div class="form-container">
    <h2>Redigera material</h2>
  <form method = "POST" action="?/editMaterial">
    <input type="hidden" name="material_id" value="{editMaterial.material_id}" />
    <!-- -->
    <label class="input-label">
        <input
        type="text"
        name="name"
        value="{editMaterial.name ?? form?.data?.name}"
        required
        placeholder="Ange materialets namn"
        />
        {#if form?.errors?.name}
        <span class="error-message">{form.errors.name[0]}</span>
        {/if}
    </label>
    <!-- type -->
    <label class="input-label">
        <input
        type="text"
        name="type"
        value="{editMaterial.type ?? form?.data?.type}"
        required
        placeholder="Ange materialets typ"
        />
        {#if form?.errors?.type}
        <span class="error-message">{form.errors.type[0]}</span>
        {/if}
    </label>
    <!-- cost_per_kg_in_kr -->
    <label class="input-label">
        <input
        type="number"
        name="cost_per_kg_in_kr"
        value="{editMaterial.cost_per_kg_in_kr ?? form?.data?.cost_per_kg_in_kr}"
        step="any"
        required
        placeholder="Ange kostnad per kg i kr"/>
        {#if form?.errors?.cost_per_kg_in_kr}
        <span class="error-message">{form.errors.cost_per_kg_in_kr[0]}</span>
        {/if}
    </label>
    <!-- density_in_kg_per_cubic_meter -->
    <label class="input-label">
        <input
        type="number"
        name="density_in_kg_per_cubic_meter"
        value="{editMaterial.density_in_kg_per_cubic_meter ?? form?.data?.density_in_kg_per_cubic_meter}"
        step="any"
        required
        placeholder="Ange densitet i kg per kubikmeter"
        />
        {#if form?.errors?.density_in_kg_per_cubic_meter}
        <span class="error-message">{form.errors.density_in_kg_per_cubic_meter[0]}</span>
        {/if}
    </label>
    <!-- supplier_id -->
    <label class = "input-label">
        <input 
        type="number"
        name="supplier_id"
        value="{editMaterial.supplier_id ?? form?.data?.supplier_id}"
        required
        placeholder="Ange leverantörens ID"
        />
        {#if form?.errors?.supplier_id}
        <span class="error-message">{form.errors.supplier_id[0]}</span>
        {/if}
    </label>

    <div class="button-group">
    <button type="submit">Spara ändringar</button>
    <button type="button" on:click={() => isEditModalVisible = false}>Stäng</button>
    </div>
  </form>
  </div>
{/if}

<!-- Add material -->
{#if showAddMaterialForm}
    <div class="form-container">
      <h2>Skapa nytt material</h2>
      <form method="POST" action="?/addMaterial">
        <label class="input-label">
          <input
            type="text"
            name="name"
            value={form?.data?.name ?? newMaterial.name ?? ''}
            placeholder="Ange materialets namn"
          />
          {#if form?.errors?.name}
            <span class="error-message">{form.errors.name[0]}</span>
          {/if}
        </label>
        <label class="input-label">
          <input 
            type="text"
            name="type"
            value={form?.data?.type ?? newMaterial.type ?? ''}
            placeholder="Ange materialets typ"
          />
          {#if form?.errors?.type}
            <span class="error-message">{form.errors.type[0]}</span>
          {/if}
        </label>
      
        <label class="input-label">
          <input
            type="number"
            name="cost_per_kg_in_kr"
            value={form?.data?.cost_per_kg_in_kr ?? newMaterial.cost_per_kg_in_kr}
            step="any"
            placeholder="Ange kostnad per kg i kr"
          />
          {#if form?.errors?.cost_per_kg_in_kr}
            <span class="error-message">{form.errors.cost_per_kg_in_kr[0]}</span> 
          {/if}
        </label>
      
        <label class="input-label">
          <input
            type="number"
            name="density_in_kg_per_cubic_meter"
            value={newMaterial.density_in_kg_per_cubic_meter}
            step="any"
            placeholder="Ange densitet i kg per kubikmeter"
          />
          {#if form?.errors?.density_in_kg_per_cubic_meter}
            <span class="error-message">{form.errors.density_in_kg_per_cubic_meter[0]}</span>
          {/if}
        </label>
      
        <label class="input-label">
          <input 
            type="number"
            name="supplier_id"
            value={form?.data?.supplier_id ?? newMaterial.supplier_id}
            placeholder="Ange leverantörens ID"
          />
          {#if form?.errors?.supplier_id}
            <span class="error-message">{form.errors.supplier_id[0]}</span> 
          {/if}
        </label>
      
        <div class="button-group">
          <button type="submit">Lägg till material</button>
          <button type="button" on:click={() => showAddMaterialForm = false}>Stäng</button>
        </div>
      </form>
    </div>
{/if}
</div>


<!-- CSS for Material Admin Dashboard -->
<style>
  .container {
    max-width: 1500px; 
    margin: auto; 
    padding: 20px; 
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
    .add-btn:hover{
      background-color: #0069D9;
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
        background-color: #007BFF; 
        color: white; 
        padding: 10px 15px; 
        border: none; 
        border-radius: 5px; 
        cursor: pointer; 
        transition: background-color 0.3s; 
        flex: 1; 
        margin-right: 10px; 
    }

  .button-group button:last-child {
        margin-right: 0; 
    }

  .button-group button:hover {
        background-color: #0056b3; 
    }
  @media (max-width: 600px) {
    .container {
      padding: 10px; 
   }

    .form-container {
      width: 100%; 
   }
  }

  /* Delete / Edit buttons */
  .btn {
    background-color: #007BFF;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.3s ease, transform 0.2s ease;
    display: inline-block;
    margin: 5px;
    text-align: center;
    text-decoration: none;
  }
  .edit-btn {
    background-color: #007BFF; 
    color: white;
  }
  .edit-btn:hover {
    background-color: #0056b3; 
    transform: translateY(-2px);
  }

  .delete-btn {
    background-color: #f44336; 
    color: white;
  }

  .delete-btn:hover {
    background-color: #e53935; 
    transform: translateY(-2px); 
  }

 
  form {
    display: inline-block;
  }

  .actions {
    text-align: center; 
  }

  .input-label {
  position: relative;
  display: block;
  margin-bottom: 5px; 
}

.error-message {
  color: rgb(241, 38, 38);
  font-size: 12px;
  margin-bottom: 3px;
  font-weight: bold;
  display: block;
  position: absolute;
  top: -15px;
  left: 5px;
  width: 100%;
}
  
</style>
  