<script setup lang="ts">
import 'primeicons/primeicons.css'
let prevScrollpos: number = window.pageYOffset

window.onscroll = function (): void {
  const currentScrollPos: number = window.pageYOffset
  const navbar = document.getElementById('navbar')

  if (navbar) {
    if (prevScrollpos > currentScrollPos) {
      navbar.style.top = '0'
    } else {
      navbar.style.top = '-50px'
    }
  }

  prevScrollpos = currentScrollPos
}

function toggleDropdown(): void {
  const myDropdown = document.getElementById('myDropdown')
  if (myDropdown) {
    myDropdown.classList.toggle('show')
  }
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (e: MouseEvent): void {
  const target = e.target as HTMLElement
  if (!target.matches('.dropbtn')) {
    const myDropdown = document.getElementById('myDropdown')
    if (myDropdown && myDropdown.classList.contains('show')) {
      myDropdown.classList.remove('show')
    }
  }
}
</script>

<template>
  <div class="navbar">
    <div class="navbar-right">
      <RouterLink to="/"> {{ $t('home') }}</RouterLink>
      <div class="dropdown">
        <button class="dropbtn" @click="toggleDropdown">
          Norsk bokmål
          <i class="fa fa-caret-down"></i>
        </button>
        <div class="dropdown-content" id="myDropdown">
          <a href="#">English</a>
          <a href="#">Norsk nynorsk</a>
          <a href="#">Sámi</a>
        </div>
      </div>
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
  transition: top 0.3s;
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
  gap: 20px;
}

.dropbtn {
  color: #d6e3ef;
  text-decoration: none;
  font-weight: medium;
  border: transparent;
  border-bottom: 5px solid transparent;
  transition: border-color 0.3s ease;
  line-height: 55px;
  font-size: larger;
  background-color: transparent;
  cursor: pointer;
}

.dropbtn:hover {
  border-bottom: 5px solid #d6e3ef;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 180px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  float: none;
  color: black;
  padding: 0px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
}

.dropdown-content a:hover {
  background-color: #ddd;
}

.dropdown .show {
  display: block;
}

.dropdown {
  cursor: pointer;
  font-size: 16px;
  border: none;
  outline: none;
  color: white;
  padding: 14px 16px;
  background-color: inherit;
  font-family: inherit;
  margin: 0;
}
</style>
