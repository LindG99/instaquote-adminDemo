<script lang="ts">
    let email = '';
    let password = '';
  </script>
  
  <form method="post">
    <label for="email">Email</label>
    <input type="email" name="email" bind:value={email} required>
  
    <label for="password">Password</label>
    <input type="password" name="password" bind:value={password} required>
  
    <button type="submit">Sign Up</button>
  </form>
  