import { signOut } from '../../services/index.js';

export default () => {
  const user = firebase.auth().currentUser;
  const timeline = (document.getElementById("container").innerHTML = `
  <link rel="stylesheet" href="./pages/Timeline/style.css" />

  <div class="banner-menu">
    <div class="banner">
      <img src="assets/logo.png" alt="Logo">
      <div class="title-container">
          <h1 class="title">SeriesDay</h1>
          <h3 class="subtitle">review de séries</h3>
      </div>
    </div>

    <input id="navbar" type='checkbox' class="input">
    <label for="navbar">
      <div class='menu'>
          <span class='hamburger'></span>
      </div>
    </label>

    <ul class="inside-menu">
      <div class="profile-container">
        <li class="upload-photo">

            <img id="preview" src="${user.photoURL || '../../assets/default-user-img.png'}" class="user-photo-menu">
            <div class="hidden-div">
              <input type="file" id="photo" class="inputImg">
              <button id="uploadImage" class="buttonImg">Alterar Foto Perfil</button>
            </div>
          
        </li>
        <li>
          <p class="username-menu"> <b>${user.displayName || "Usuário"} </b> </p>
        </li>
        <li>
          <p class="email-menu"> ${user.email || "Usuário"} </p>
        </li>
      </div>

      <button id="signout-button" class="signout-button buttons">
        <img src="./assets/exit.png" alt="Ícone de Saída">
      </button>
    </ul>
  </div>
    <form action="" id="postForm">
      <textarea type="textarea" id="postText" class="post-textarea" rows="5" cols="50" placeholder="Digite aqui sua review..."></textarea>
      <button type="submit" class="buttons post-button"> Publicar </button>
    </form>

    <ul id="posts"></ul>

  `);

  //Sair da conta do usuário
  document.getElementById("signout-button").addEventListener("click", (e) => {
    e.preventDefault();
    signOut();
  });

  // Criando coleção no firebase chamada 'posts'
  const postsCollection = firebase.firestore().collection("posts");

  // Enviando posts para o firestore
  document.getElementById("postForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const text = document.getElementById("postText").value;

    const getData = () => {
      const data = new Date();
      return data.toLocaleString();
    };

    const post = {
      user: firebase.auth().currentUser.email,
      text: text,
      likes: [],
      data: getData(),
    };

    postsCollection.add(post).then(() => {
      document.getElementById("postText").value = "";
      loadPosts();
    });
  });

  // Adicionando posts
  function createTemplatePost(post) {
    const date = new Date();
    
    const postTemplate = `
      <li class="posts-box">
        <div id="${post.id}"class="post-container">
          <div class="user-container">
            <img src="${user.photoURL || '../../assets/default-user-img.png'}" class="user-photo">
            <div class="username-date-container">
              <p class="username"> ${user.displayName || "Usuário"} </p>
              <time class="date">${date.toLocaleString('pt-BR')}</time>
            </div>
          </div>

          <p class="post-value"> ${post.data().text} </p>
      
          <div id=${post.id} class="like-comment">
            <button class="likePost-btn timeline-buttons">❤️ ${post.data().likes}</button>  
          </div>
        </div>
          
        <div id=${post.id} class="buttons-container">
          <button class="editPost-btn timeline-buttons">✏️</button>
          <button class="deletePost-btn timeline-buttons">🗑️</button>
        </div>
      </li>
    `;
    document.getElementById("posts").innerHTML += postTemplate;

    // Deletando posts
    const deleteButtons = document.querySelectorAll(".deletePost-btn");
    for (const button of deleteButtons) {
      button.addEventListener("click", function (event) {
        const deleteConfirmation = confirm("Tem certeza quer deseja deletar esse post?");

        if(deleteConfirmation) {
          deletePost(event.target.parentNode.id);
        }
        else {
          return false;
        }
        
      });
    }

    function deletePost(id) {
      postsCollection
        .doc(id)
        .delete()
        .then(() => {
          loadPosts();
        });
    }

    // Curtindo posts
    const likeButtons = document.querySelectorAll(".likePost-btn");

    for (const button of likeButtons) {
      button.addEventListener("click", function (event) {
        console.log(event.target.parentNode.id);
        addLikes(event.target.parentNode.id);
      });
    }

    function addLikes(id) {
      postsCollection
        .doc(id)
        .update({
          likes: firebase.firestore.FieldValue.increment(1),
        })
        .then(() => {
          loadPosts();
        });
    }

    const visibilityOfButtons = (document, user) => {
      if (user !== firebase.auth().currentUser.email) {
        document.querySelector('.deletePost-btn').classList.add('visibility-hidden');
        document.querySelector('.editPost-btn').classList.add('visibility-hidden');
      }
    };
  
    visibilityOfButtons(document, user);
  }

  

  // Adicionando foto do perfil
  const uploadImage = document.querySelector('#uploadImage');
  uploadImage.addEventListener('click', () => {
    console.log('botão de upa img');
    const ref = firebase.storage().ref();
    const file = document.querySelector('#photo').files[0];
    const name = new Date() + '-' + file.name
    const metadata = {
      contentType: file.type,
    };
    const task = ref.child(name).put(file, metadata);
    task
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(url => {
        console.log(url);
        console.log('imagem upada');
        const image = document.querySelector('#preview');
        image.src = url;
        const userUp = firebase.auth().currentUser;
        userUp.updateProfile({
          photoURL: url,
        });
        location.reload();
      });
  });

  // Mostrando os posts na tela
  function loadPosts() {
    document.getElementById("posts").innerHTML = `<span class="loading-post">Carregando posts...</span>`;

    postsCollection.get().then((snap) => {
      document.getElementById("posts").innerHTML = "";
      snap.forEach((post) => {
        createTemplatePost(post);
      });
    });
  }

  loadPosts();

  return timeline;
};
