// Google SSO Authentication Module
// Manages user authentication and role-based permissions
// NOTE: clearChatHistory() is called on sign-out and sign-in to ensure
// each new session starts with a fresh, empty chat.

const GOOGLE_CLIENT_ID = '172636652682-io9g39mrg4kfima34l51276pgrlidv4i.apps.googleusercontent.com';
const AUTH_STORAGE_KEY = 'ai_vip_auth';

// Auth state
let currentUser = null;

// Initialize Google Sign-In
async function initGoogleAuth() {
  // Check if Google Identity Services is loaded
  if (typeof google === 'undefined' || !google.accounts) {
    console.log('Waiting for Google Identity Services to load...');
    // Retry after a short delay
    setTimeout(initGoogleAuth, 100);
    return;
  }

  try {
    // Load Google Identity Services
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Restore session from localStorage
    await restoreSession();

    // Update UI based on current auth state
    updateAuthUI();

    console.log('✓ Google Sign-In initialized');
  } catch (error) {
    console.error('Error initializing Google Sign-In:', error);
  }
}

// Handle successful Google Sign-In
async function handleGoogleSignIn(response) {
  try {
    // Sign in to Firebase Auth with the Google credential
    const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
    await firebase.auth().signInWithCredential(credential);

    // Decode the JWT token
    const payload = parseJwt(response.credential);

    // Extract user info
    const email = payload.email;
    const name = payload.name || email;
    const picture = payload.picture;

    // Fetch user role from Firestore
    const role = await getUserRole(email);

    // Create user object
    currentUser = {
      email,
      name,
      picture,
      role,
      signedInAt: new Date().toISOString()
    };

    console.log('User signed in:', currentUser);
    console.log('Firebase Auth user:', firebase.auth().currentUser);

    // Save to localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));

    // Clear chat history for fresh session on new sign-in
    if (window.chatbot && typeof window.chatbot.clearChatHistory === 'function') {
      window.chatbot.clearChatHistory();
    }

    // Update UI
    updateAuthUI();

    // Show welcome message based on role
    if (role === 'admin') {
      showNotification(`Welcome, ${name}! You're signed in as an administrator.`, 'success');
    } else if (role === 'contributor') {
      showNotification(`Welcome, ${name}! You can now contribute research entries.`, 'success');
    } else {
      showNotification(`Welcome, ${name}!`, 'info');
    }

    // Dispatch custom event for other parts of the app
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: currentUser }));

  } catch (error) {
    console.error('Error handling sign-in:', error);
    showNotification('Failed to sign in. Please try again.', 'error');
  }
}

// Fetch user role from Firestore
async function getUserRole(email) {
  try {
    const db = window.firebaseApp.db;
    const userDoc = await db.collection('users').doc(email).get();

    if (userDoc.exists && userDoc.data().role) {
      console.log(`Found existing user ${email} with role:`, userDoc.data().role);
      return userDoc.data().role;
    }

    // Default role for new users - create their profile
    console.log(`Creating new user profile for ${email} with role: visitor`);
    await db.collection('users').doc(email).set({
      email: email,
      role: 'visitor',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return 'visitor';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'visitor';
  }
}

// Parse JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

// Restore session from localStorage
async function restoreSession() {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      currentUser = JSON.parse(storedAuth);
      console.log('Restored session for:', currentUser.email);

      // Check if session is still valid (e.g., within 7 days)
      const signedInAt = new Date(currentUser.signedInAt);
      const daysSinceSignIn = (Date.now() - signedInAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceSignIn > 7) {
        // Session expired
        signOut();
        return;
      }

      // Re-fetch user role from Firestore in case it changed
      const updatedRole = await getUserRole(currentUser.email);
      currentUser.role = updatedRole;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      console.log('Updated role from Firestore:', updatedRole);
    }
  } catch (error) {
    console.error('Error restoring session:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// Sign out
async function signOut() {
  currentUser = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);

  // Sign out from Firebase Auth
  if (firebase.auth().currentUser) {
    await firebase.auth().signOut();
  }

  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect();
  }

  // Clear chat history on sign-out
  if (window.chatbot && typeof window.chatbot.clearChatHistory === 'function') {
    window.chatbot.clearChatHistory();
  }

  updateAuthUI();
  showNotification('You have been signed out.', 'info');
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: null }));
}

// Update authentication UI
function updateAuthUI() {
  const authContainer = document.getElementById('auth-container-dropdown');
  const menuTrigger = document.getElementById('user-menu-trigger');

  if (!authContainer) return;

  if (currentUser) {
    // User is signed in - show user info and sign out
    authContainer.innerHTML = `
      <div class="dropdown-item" style="padding: 12px; border-bottom: 1px solid #eee; pointer-events: none;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${currentUser.picture}" alt="${currentUser.name}" style="width: 40px; height: 40px; border-radius: 50%;">
          <div style="display: flex; flex-direction: column;">
            <strong style="color: #2d2d2d;">${currentUser.name}</strong>
            <small style="color: #666;">${currentUser.email}</small>
          </div>
        </div>
      </div>
      <button class="dropdown-item" onclick="window.signOut(); toggleHeaderMenu();">
        <i class="fas fa-sign-out-alt"></i> Sign Out
      </button>
    `;

    // Update menu trigger to show user's profile picture
    if (menuTrigger) {
      menuTrigger.innerHTML = `<img src="${currentUser.picture}" alt="${currentUser.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`;
    }
  } else {
    // User is not signed in - show sign in prompt
    authContainer.innerHTML = `
      <div id="google-signin-button-dropdown" class="dropdown-item" style="padding: 0;"></div>
    `;

    // Reset menu trigger to default user icon
    if (menuTrigger) {
      menuTrigger.innerHTML = `<i class="fas fa-user-circle"></i>`;
    }

    // Render Google Sign-In button in dropdown
    setTimeout(() => {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        try {
          google.accounts.id.renderButton(
            document.getElementById('google-signin-button-dropdown'),
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: 200
            }
          );
        } catch (error) {
          console.error('Error rendering Google Sign-In button:', error);
          document.getElementById('google-signin-button-dropdown').innerHTML = `
            <button class="dropdown-item" onclick="initGoogleAuth()">
              <i class="fab fa-google"></i> Sign In with Google
            </button>
          `;
        }
      }
    }, 100);
  }

  // Update contribute button visibility
  updateContributeButton();

  // Update admin menu visibility
  updateAdminMenu();
}

// Update admin menu visibility based on role
function updateAdminMenu() {
  const adminMenuItem = document.getElementById('admin-menu-item');
  console.log('Updating admin menu. Current user:', currentUser);
  console.log('Admin menu item element:', adminMenuItem);
  if (adminMenuItem) {
    const shouldShow = (currentUser && currentUser.role === 'admin');
    console.log('Should show admin menu:', shouldShow);
    adminMenuItem.style.display = shouldShow ? 'flex' : 'none';
  }
}

// Update contribute button based on auth state
function updateContributeButton() {
  const contributeBtn = document.querySelector('.contribute-btn');
  const addPerspectiveBtns = document.querySelectorAll('.add-perspective-btn');

  // Hide the contribute button in header (use dropdown menu instead)
  if (contributeBtn) {
    contributeBtn.style.display = 'none';
  }

  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'contributor')) {
    // Admin or Contributor - enable contribute features
    addPerspectiveBtns.forEach(btn => {
      btn.style.display = 'inline-block';
      btn.disabled = false;
    });
  } else {
    // Visitor or not signed in - disable contribute features

    addPerspectiveBtns.forEach(btn => {
      btn.style.display = 'inline-block';
      btn.disabled = true;
      btn.title = 'Sign in to contribute';
      btn.innerHTML = '<i class="fas fa-lock"></i> Sign in to Add Perspective';
    });
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Remove after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Public API
function getCurrentUser() {
  return currentUser;
}

function isTeamMember() {
  return currentUser && currentUser.role === 'team';
}

function isSignedIn() {
  return currentUser !== null;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleAuth);
} else {
  initGoogleAuth();
}

// Export functions for global access
window.auth = {
  getCurrentUser,
  isTeamMember,
  isSignedIn,
  signOut,
  updateContributeButton,
};

// Make signOut directly accessible for onclick handlers
window.signOut = signOut;
