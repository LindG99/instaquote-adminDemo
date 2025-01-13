<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { materialSchema, materialWithIdSchema, type materialIdSchema } from '$lib';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	let { data } = $props();

	//Create
	const form = superForm(data.createNewForm, {
		validators: zodClient(materialSchema),
		resetForm: true
	});
	const { form: createFormData, enhance: CreateEnchance } = form;

	//Edit
	const editForm = superForm(data.editForm, {
		validators: zodClient(materialWithIdSchema),
		resetForm: true
	});
	const { form: editFormData, enhance: editEnhance } = editForm;

	//Remove
	const { enhance: removeEnhance } = superForm(data.removeForm, {
		resetForm: true
	});

	//views
	let showAddMaterialForm = $state(false); //Add modal view
	let isEditModalVisible = $state(false); // Edit modal view

	const openEditModal = (materialToBeEditet: any) => {
		$editFormData = materialToBeEditet;
		isEditModalVisible = true;
		showAddMaterialForm = false;
	};

	const openAddMaterial = () => {
		showAddMaterialForm = true;
		isEditModalVisible = false;
	};

	type MaterialWithId = z.infer<typeof materialWithIdSchema>;
	//Sort & Search
	let sortBy: keyof MaterialWithId = $state('name'); //standardcolumn to sort by
	let sortDirection = $state('asc'); //asc
	let searchTerm = $state(''); // Search material
	let materials: MaterialWithId[] = []; // Lista med material (ersätt med din verkliga data)

	const sortMaterials = (materials: MaterialWithId[]) => {
		return materials.slice().sort((a, b) => {
			const valueA = a[sortBy];
			const valueB = b[sortBy];

			if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
			if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	};
	const updateSort = (column: keyof MaterialWithId) => {
		if (sortBy === column) {
			// Byt sorteringsriktning om samma kolumn klickas
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Ändra sorteringskolumn och återställ riktning till asc
			sortBy = column;
			sortDirection = 'asc';
		}
	};
	const filterMaterials = (materials: MaterialWithId[]) => {
		return materials.filter((material) =>
			material.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	};

	// Kombinera sökning och sortering
	const filteredAndSortedMaterials = () => {
		const filtered = filterMaterials(data.materials);
		return sortMaterials(filtered);
	};
</script>

<!-- HTML for Dashboard material -->
<div class="container">
	<div class="dashboard">
		<h1>Material Admin Dashboard</h1>

		<!-- Sökfält -->
		<div>
			<input
				type="text"
				bind:value={searchTerm}
				placeholder="Sök efter material..."
				class="search-input"
			/>
		</div>
		<!-- Material Table. -->
		<table>
			<thead>
				<tr>
					<th
						onclick={() => updateSort('name')}
						class={sortBy === 'name' ? 'sorted ' + sortDirection : ''}
					>
						Name
						{#if sortBy === 'name'}
							<span class="sort-direction">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th
						onclick={() => updateSort('type')}
						class={sortBy === 'type' ? 'sorted ' + sortDirection : ''}
					>
						Type
						{#if sortBy === 'type'}
							<span class="sort-direction">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th
						onclick={() => updateSort('cost_per_kg_in_kr')}
						class={sortBy === 'cost_per_kg_in_kr' ? 'sorted ' + sortDirection : ''}
					>
						Cost per kg (kr)
						{#if sortBy === 'cost_per_kg_in_kr'}
							<span class="sort-direction">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th
						onclick={() => updateSort('density_in_kg_per_cubic_meter')}
						class={sortBy === 'density_in_kg_per_cubic_meter' ? 'sorted ' + sortDirection : ''}
					>
						Density (kg/m³)
						{#if sortBy === 'density_in_kg_per_cubic_meter'}
							<span class="sort-direction">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th
						onclick={() => updateSort('supplier_id')}
						class={sortBy === 'supplier_id' ? 'sorted ' + sortDirection : ''}
					>
						Supplier ID
						{#if sortBy === 'supplier_id'}
							<span class="sort-direction">{sortDirection === 'asc' ? '↑' : '↓'}</span>
						{/if}
					</th>
					<th>Redigera / Ta bort</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredAndSortedMaterials() as material}
					<tr>
						<td>{material.name}</td>
						<td>{material.type}</td>
						<td>{material.cost_per_kg_in_kr}</td>
						<td>{material.density_in_kg_per_cubic_meter}</td>
						<td>{material.supplier_id}</td>
						<td class="actions">
							<!-- Edit material button -->
							<button class="btn edit-btn" onclick={() => openEditModal(material)}>Redigera</button>
							<!-- Delete Material -->
							<form method="POST" use:removeEnhance action="?/removeMaterial">
								<input type="hidden" name="material_id" bind:value={material.material_id} />
								<button class="btn delete-btn" type="submit">Ta bort</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Add new material button -->
	<button class="add-btn" onclick={openAddMaterial}>Skapa nytt material</button>

	{#if isEditModalVisible}
		<!-- Edit material -->
		<div class="form-container">
			<h2>Redigera material</h2>
			<form use:editEnhance method="POST" action="?/editMaterial">
				<input type="hidden" name="material_id" bind:value={$editFormData.material_id} />
				<!-- name -->
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Materialets namn</Form.Label>
							<Input
								{...props}
								bind:value={$editFormData.name}
								placeholder="Ange materialets namn"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<!-- type -->
				<Form.Field {form} name="type">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Materialets typ</Form.Label>
							<Input
								{...props}
								bind:value={$editFormData.type}
								placeholder="Ange materialets typ"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<!-- cost_per_kg_in_kr -->
				<Form.Field {form} name="cost_per_kg_in_kr">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Kostnad per kg i kr</Form.Label>
							<Input
								{...props}
								type="number"
								bind:value={$editFormData.cost_per_kg_in_kr}
								step="any"
								placeholder="Ange kostnad per kg i kr"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Priset för materialet per kilo.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<!-- density_in_kg_per_cubic_meter -->
				<Form.Field {form} name="density_in_kg_per_cubic_meter">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Densitet i kg per kubikmeter</Form.Label>
							<Input
								{...props}
								type="number"
								bind:value={$editFormData.density_in_kg_per_cubic_meter}
								step="any"
								placeholder="Ange densitet i kg per kubikmeter"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>Materialets densitet i kg/m³.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<!-- supplier_id -->
				<Form.Field {form} name="supplier_id">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Leverantörens ID</Form.Label>
							<Input
								{...props}
								type="number"
								bind:value={$editFormData.supplier_id}
								placeholder="Ange leverantörens ID"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>ID för leverantören av materialet.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<div class="button-group">
					<Form.Button>Uppdatera material</Form.Button>
					<Form.Button type="button" onclick={() => (isEditModalVisible = false)}>Stäng</Form.Button
					>
				</div>
			</form>
		</div>
	{/if}
	<!-- Add material -->
	{#if showAddMaterialForm}
		<div class="form-container">
			<h2>Skapa nytt material</h2>
			<form use:CreateEnchance method="POST" action="?/addMaterial">
				<!-- Name -->
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Materialets namn</Form.Label>
							<Input
								{...props}
								bind:value={$createFormData.name}
								placeholder="Ange materialets namn"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<!-- type -->
				<Form.Field {form} name="type">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Materialets typ</Form.Label>
							<Input
								{...props}
								bind:value={$createFormData.type}
								placeholder="Typen av material, t.ex. metall, plast"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<!-- cost_per_kg_in_kr -->
				<Form.Field {form} name="cost_per_kg_in_kr">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Kostnad per kg i kr</Form.Label>
							<Input
								{...props}
								type="number"
								bind:value={$createFormData.cost_per_kg_in_kr}
								step="any"
								placeholder="Ange kostnad per kg i kr"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<!-- density_in_kg_per_cubic_meter -->
				<Form.Field {form} name="density_in_kg_per_cubic_meter">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Densitet i kg per kubikmeter</Form.Label>
							<Input
								{...props}
								type="number"
								bind:value={$createFormData.density_in_kg_per_cubic_meter}
								step="any"
								placeholder="Ange densitet i kg per kubikmeter"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<!-- supplier_id -->
				<Form.Field {form} name="supplier_id">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Leverantörens ID</Form.Label>
							<Input
								{...props}
								type="number"
								bind:value={$createFormData.supplier_id}
								placeholder="Ange leverantörens ID"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="button-group">
					<Form.Button>Lägg till material</Form.Button>
					<Form.Button type="button" onclick={() => (showAddMaterialForm = false)}
						>Stäng</Form.Button
					>
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
		font-family: 'Arial', sans-serif;
		font-size: 36px;
		font-weight: 700;
		color: #4a90e2;
		text-align: center;
		margin-top: 50px;
		margin-bottom: 20px;
		text-transform: uppercase;
		letter-spacing: 2px;
		background: linear-gradient(135deg, #4a90e2, #1d3557);
		color: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: fit-content;
		margin-left: auto;
		margin-right: auto;
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

	th,
	td {
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
		background-color: #007bff;
		color: white;
		margin-top: 10px;
		padding: 10px 15px;
		text-align: center;
		border-radius: 5px;
		text-decoration: none;
		display: inline-block;
	}
	.add-btn:hover {
		background-color: #0069d9;
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

	@media (max-width: 600px) {
		.container {
			padding: 10px;
		}

		.form-container {
			width: 100%;
		}
	}
	th {
		cursor: pointer;
		padding: 10px;
		text-align: left;
	}
	/* Show arrow while sorting */
	.sorted {
		font-weight: bold;
	}

	.sorted.asc::after {
		content: ' ↑';
	}

	.sorted.desc::after {
		content: ' ↓';
	}

	/* Hover-effect */
	th:hover {
		background-color: #f1f1f1;
	}

	/* Arrow for sorting */
	.sort-direction {
		font-size: 12px;
		margin-left: 8px;
	}
	.search-input {
		padding: 10px;
		font-size: 16px;
		width: 100%;
		max-width: 400px;
		margin-bottom: 20px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 10px;
		text-align: left;
	}

	th {
		cursor: pointer;
	}

	button {
		background: none;
		border: none;
		font-size: inherit;
		color: inherit;
		cursor: pointer;
	}

	button:hover {
		text-decoration: underline;
	}
	/* Delete / Edit buttons */
	.btn {
		background-color: #007bff;
		color: white;
		padding: 10px 15px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 600;
		transition:
			background-color 0.3s ease,
			transform 0.2s ease;
		display: inline-block;
		margin: 5px;
		text-align: center;
		text-decoration: none;
	}
	.edit-btn {
		background-color: #007bff;
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
</style>
