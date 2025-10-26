<template>
  <nav class="navbar">
    <div class="container navbar-container">
      <div class="navbar-brand">
        <RouterLink to="/" class="logo">
          <span class="logo-icon">📦</span>
          <span class="logo-text">Log</span>
        </RouterLink>
      </div>

      <!-- Desktop Navigation -->
      <div class="navbar-menu desktop-only">
        <RouterLink to="/assets" class="nav-link">
          <span class="nav-icon">📦</span>
          Assets
        </RouterLink>
        <RouterLink to="/loans" class="nav-link">
          <span class="nav-icon">🔄</span>
          Loans
        </RouterLink>
        <RouterLink to="/logbook" class="nav-link">
          <span class="nav-icon">📖</span>
          Logbook
        </RouterLink>
        <RouterLink to="/issues" class="nav-link">
          <span class="nav-icon">⚠️</span>
          Issues
        </RouterLink>
      </div>

      <div class="navbar-actions desktop-only">
        <RouterLink to="/profile" class="profile-link">
          <div class="avatar avatar-placeholder">
            A
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <div class="mobile-nav mobile-only">
      <RouterLink to="/" class="mobile-nav-item">
        <span class="mobile-nav-icon">🏠</span>
        <span class="mobile-nav-label">Home</span>
      </RouterLink>
      <RouterLink to="/assets" class="mobile-nav-item">
        <span class="mobile-nav-icon">📦</span>
        <span class="mobile-nav-label">Assets</span>
      </RouterLink>
      <RouterLink to="/loans" class="mobile-nav-item">
        <span class="mobile-nav-icon">🔄</span>
        <span class="mobile-nav-label">Loans</span>
      </RouterLink>
      <RouterLink to="/logbook" class="mobile-nav-item">
        <span class="mobile-nav-icon">📖</span>
        <span class="mobile-nav-label">Logbook</span>
      </RouterLink>
      <RouterLink to="/profile" class="mobile-nav-item">
        <span class="mobile-nav-icon">👤</span>
        <span class="mobile-nav-label">Profile</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.navbar {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.navbar-brand .logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 1.75rem;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9375rem;
  transition: var(--transition);
}

.nav-link:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-link.router-link-active {
  background-color: #EEF2FF;
  color: var(--primary-color);
}

.nav-icon {
  font-size: 1.125rem;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-link {
  text-decoration: none;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
  transition: var(--transition);
}

.avatar:hover {
  border-color: var(--primary-color);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

/* Mobile Navigation */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  color: var(--text-secondary);
  transition: var(--transition);
  min-width: 4rem;
}

.mobile-nav-item:active {
  transform: scale(0.95);
}

.mobile-nav-item.router-link-active {
  color: var(--primary-color);
}

.mobile-nav-icon {
  font-size: 1.5rem;
}

.mobile-nav-label {
  font-size: 0.6875rem;
  font-weight: 500;
}

.desktop-only {
  display: none;
}

.mobile-only {
  display: flex;
}

@media (min-width: 768px) {
  .desktop-only {
    display: flex;
  }

  .mobile-only {
    display: none;
  }
}
</style>
