<template>
  <div class="page">
    <!-- Navbar -->
    <nav class="navbar">
      <h1 class="logo">ny navbar</h1>
      <div class="nav-links">
        <a href="#" class="active">Min Side</a>
        <a href="#">Logg inn</a>
        <a href="#">Registrer</a>
        <button title="Språk">🌐</button>
        <button title="Varsler">🔔</button>
      </div>
    </nav>

    <!-- Main content -->
    <main class="main-content">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <span>Hjem</span> &gt; <span class="current">Under</span>
      </div>

      <!-- Heading -->
      <h2 class="page-title">Under</h2>

      <!-- Grid: News + Map -->
      <div class="content-grid">
        <!-- News Section -->
        <section class="news">
          <div class="news-header">
            <h3>Nyheter</h3>
            <a href="#" class="se-mer">Se mer</a>
          </div>

          <ul class="timeline">
            <li>
              <div class="dot"></div>
              <div class="timeline-content">
                <strong>14:32</strong> – Strømbrudd i Midtbyen
              </div>
            </li>
            <li>
              <div class="dot"></div>
              <div class="timeline-content">
                <strong>14:02</strong> – Brann ved kraftverk
              </div>
            </li>
            <li>
              <div class="dot"></div>
              <div class="timeline-content">
                <strong>09:24</strong> – Bakterier funnet i drikkevann
              </div>
            </li>
          </ul>
        </section>

        <!-- Map Placeholder -->
        <section class="map-placeholder">
          <div class="map-box">
            <span>[Kart vises her når det er implementert]</span>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
// no logic for now
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

.page {
  font-family: 'Inter', sans-serif;
  background: var(--background-color);
  color: var(--text-color);
  min-height: 100vh;
  margin: 0;
}

.navbar {
  background-color: var(--secondary-color);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: bold;
  font-size: 1.2rem;
}

.nav-links {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
}

.nav-links .active {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  background: white;
  padding: 4rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.breadcrumb {
  font-size: 0.875rem;
  color: gray;
  margin-bottom: 1rem;
}

.breadcrumb .current {
  color: black;
  font-weight: 500;
}

.page-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.news-header h3 {
  font-size: 2rem;
  color: var(--third-color);
}

.news-header .se-mer {
  font-size: 0.875rem;
  color: var(--third-color);
  text-decoration: underline;
}

.timeline {
  position: relative;
  margin: 1.5rem 0;
  padding-left: 2rem;
  list-style: none;
  border-left: 2px solid var(--third-color);
}

.timeline li {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.dot {
  position: absolute;
  left: -2.4rem;
  top: 0.45rem;
  width: 0.75rem;
  height: 0.75rem;
  background-color: var(--third-color);
  border-radius: 50%;
  z-index: 1;
}

.timeline-content {
  position: relative;
  z-index: 2;
  color: var(--text-color);
}

.map-placeholder .map-box {
  width: 100%;
  height: 300px;
  background: var(--fifth-color);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--third-color);
  border: 1px solid var(--fourth-color);
  border-radius: 8px;
}

/* Variabler – light mode */
:root {
  --background-color: #f9fafb;
  --text-color: #1a1a1a;
  --primary-color: #123456;
  --secondary-color: #0b1c2c;
  --third-color: #345a89;
  --fourth-color: #7fa1c1;
  --fifth-color: #d6e3ef;
  --red-text-color: #b71c1c;
  --red-background-color: #ffcdd2;
  --green-text-color: #1c4421;
  --green-background-color: #a5d6a7;
  --orange-text-color: #e65100;
  --orange-background-color: #ffe0b2;
}

/* override dark-mode for now */
.dark-mode {
  --background-color: #121212;
  --text-color: #f1f5f9;
  --red-background-color: #ff8a80;
  --orange-text-color: #ffab40;
  --orange-background-color: #ffab40;
}
</style>

