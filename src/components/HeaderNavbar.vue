<script setup lang="ts"></script>

<template>
  <div class="navbar">
    <div class="navbar-right">
      <RouterLink to="/"> {{ $t('home') }}</RouterLink>
      <RouterLink to="/"> {{ $t('language') }}</RouterLink>
    </div>
    <div class="navbar-left">
      <RouterLink to="/"> {{ $t('login') }}</RouterLink>
      <RouterLink to="/"> {{ $t('signup') }}</RouterLink>
    </div>
  </div>
</template>

<style>
.navbar {
  box-shadow: 0px 5px 6px rgb(0, 0, 0, 0.25);
  height: 60px;
  background-color: rgba(18, 52, 86, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.navbar a {
  color: #d6e3ef;
  text-decoration: none;
  font-weight: medium;
  border-bottom: 5px solid transparent;
  transition: border-color 0.3s ease;
  line-height: 55px;
  font-size: larger;
}

.navbar a:hover {
  border-bottom: 5px solid #d6e3ef;
}

.navbar-left,
.navbar-right {
  display: flex;
  gap: 15px;
}
</style>
