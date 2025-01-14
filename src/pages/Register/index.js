import { saveUserUpdate, saveUser, registerUser } from '../../services/index.js';

export default function Register() {
  const register = document.createElement('div');
  register.innerHTML = `
      <link rel="stylesheet" href="./pages/Register/style.css" />

      <main class="box">
          <div class="container">
            <div class="banner">
                <img src="assets/logo.png" alt="Logo">
                <div class="title-container">
                    <h1 class="title">SeriesDay</h1>
                    <h3 class="subtitle">review de séries</h3>
                </div>
            </div>
              
            <section>
                <form class="form">
                    <input class="input" id="name" type="name" autocomplete="on" placeholder="🗒  Nome Completo" required>
                    <input class="input" id="email" type="email autocomplete="on" placeholder="✉  E-mail" required>
                    <p id="email-error" class="error-message font-work"></p>

                    <input class="input" id="password" type="password" autocomplete="on" placeholder="⚙  Senha" required>

                    <p class="error-message font-work" id="password-length"></p>

                    <input class="input" id="password-confirm" type="password" autocomplete="on" placeholder="⚙  Confirmar Senha" required>

                    <p class="error-message font-work" id="password-error"></p>
                </form>
                <button id="signup-button-register" class="buttons register-button">Cadastrar-se</button>
                <button id="gobackButton" class="goback-button">
                    <img src="./assets/arrow.png" alt="Ícone de Seta"> 
                </button>
            </section>
          </div>
      </main>
      
    `;

  const profileName = register.querySelector('#name');
  const email = register.querySelector('#email');
  const password = register.querySelector('#password');
  const emailError = register.querySelector('#email-error');

  const signUpButtonRegister = register.querySelector('#signup-button-register');
  const gobackButton = register.querySelector('#gobackButton');

  const passwordLength = register.querySelector('#password-length');
  const passwordConfirm = register.querySelector('#password-confirm');
  const passwordError = register.querySelector('#password-error');

  signUpButtonRegister.addEventListener('click', (e) => {
    e.preventDefault();
    registerUser(email.value, password.value)
      .then((userUpdate) => {
        saveUserUpdate(profileName.value);
        saveUser(userUpdate.user, email.value, profileName.value);
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/email-already-in-use') {
          emailError.style.color = 'red';
          emailError.innerHTML = 'E-mail já cadastrado';
        } else if (errorCode === 'auth/invalid-email') {
          emailError.style.color = 'red';
          emailError.innerHTML = 'Insira um e-mail válido';
        }
      });
  });

  const verifyPasswordLength = () => {
    if (password.value.length < 6) {
      passwordLength.style.color = 'red';
      passwordLength.innerHTML = 'Senha com mínimo de 6 dígitos';
    } else {
      passwordLength.style.color = 'darkgreen';
      passwordLength.innerHTML = 'Senha válida!';
    }
  };

  const verifyConfirmPassword = () => {
    if (password.value !== passwordConfirm.value) {
      passwordError.style.color = 'red';
      passwordError.innerHTML = 'Senhas não correspondentes';
      return false;
    }
    passwordError.style.color = 'darkgreen';
    passwordError.innerHTML = 'Senhas confirmadas!';
    return true;
  };

  passwordConfirm.addEventListener('input', verifyConfirmPassword);
  password.addEventListener('input', verifyPasswordLength);

  gobackButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '';
  });

  return register;
}
