
const botao = document.querySelector("#botao");
const mensagem = document.querySelector("#mensagem");
const artigos = document.querySelectorAll(".cartao-informacao");

const listaCategorias = document.querySelector("#listaCategorias");
const mensagemCategorias = document.querySelector("#mensagemCategorias");

const formularioBusca = document.querySelector("#formBusca");
const termoBusca = document.querySelector("#termoBusca");
const mensagemBusca = document.querySelector("#mensagemBusca");
const resultadosApi = document.querySelector("#resultadosApi");

const formulario = document.querySelector("#formularioJogo");
const mensagemCadastro = document.querySelector("#mensagemCadastro");
const listaJogos = document.querySelector("#listaJogos");

console.log("Quantidade de informações:", artigos.length);


function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.classList.remove("erro");
    elemento.classList.remove("sucesso");
    elemento.classList.add(tipo);
}


botao.addEventListener("click", function() {
    if (artigos.length > 0) {
        mostrarMensagem(mensagem, "Essas informações ajudam na escolha de um jogo.", "sucesso");
    } else {
        mostrarMensagem(mensagem, "Nenhuma informação encontrada.", "erro");
    }
});


async function carregarCategorias() {
    try {
        const resposta = await fetch("categorias.json");
        const dados = await resposta.json();

        for (let i = 0; i < dados.categorias.length; i++) {
            const categoria = dados.categorias[i];
            const cartao = document.createElement("article");
            const titulo = document.createElement("h3");
            const descricao = document.createElement("p");

            cartao.classList.add("cartao-categoria");
            titulo.textContent = categoria.nome;
            descricao.textContent = categoria.descricao;

            cartao.appendChild(titulo);
            cartao.appendChild(descricao);
            listaCategorias.appendChild(cartao);
        }

        console.log("Categorias carregadas:", document.querySelectorAll(".cartao-categoria").length);
    } catch (erro) {
        mostrarMensagem(mensagemCategorias, "Não foi possível carregar as categorias.", "erro");
        console.log(erro);
    }
}


function criarCartao(jogo) {
    const cartao = document.createElement("article");
    const titulo = document.createElement("h3");
    const lancamento = document.createElement("p");
    const nota = document.createElement("p");
    const link = document.createElement("a");

    cartao.classList.add("cartao-jogo");

    if (jogo.background_image) {
        const imagem = document.createElement("img");
        imagem.src = jogo.background_image;
        imagem.alt = "Imagem do jogo " + jogo.name;
        cartao.appendChild(imagem);
    }

    titulo.textContent = jogo.name;
    lancamento.textContent = "Lançamento: " + (jogo.released || "Não informado");
    nota.textContent = "Nota RAWG: " + (jogo.rating || "Sem avaliação");

    link.href = "https://rawg.io/games/" + jogo.slug;
    link.textContent = "Ver detalhes na RAWG";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    cartao.appendChild(titulo);
    cartao.appendChild(lancamento);
    cartao.appendChild(nota);

    if (jogo.parent_platforms && jogo.parent_platforms.length > 0) {
        const plataformas = document.createElement("p");
        let nomes = "";

        for (let i = 0; i < jogo.parent_platforms.length; i++) {
            if (i > 0) {
                nomes = nomes + ", ";
            }
            nomes = nomes + jogo.parent_platforms[i].platform.name;
        }

        plataformas.textContent = "Plataformas: " + nomes;
        cartao.appendChild(plataformas);
    }

    cartao.appendChild(link);
    resultadosApi.appendChild(cartao);
}


async function buscarJogos(evento) {
    evento.preventDefault();

    const pesquisa = termoBusca.value.trim();
    resultadosApi.innerHTML = "";

    if (pesquisa === "") {
        mostrarMensagem(mensagemBusca, "Digite o nome de um jogo.", "erro");
        return;
    }

    if (API_KEY === "2495ee56ad414963aaccd5ae77a9e46e") {
        mostrarMensagem(mensagemBusca, "Coloque sua chave da RAWG no arquivo config.js.", "erro");
        return;
    }

    mensagemBusca.textContent = "Buscando jogos...";

    const endereco = "https://api.rawg.io/api/games?key=" + API_KEY +
        "&search=" + encodeURIComponent(pesquisa) + "&genres=racing&page_size=6";

    try {
        const resposta = await fetch(endereco);
        const dados = await resposta.json();

        if (dados.results.length === 0) {
            mostrarMensagem(mensagemBusca, "Nenhum jogo encontrado. Tente outro nome.", "erro");
        } else {
            mensagemBusca.textContent = "Jogos encontrados: " + dados.results.length;

            for (let i = 0; i < dados.results.length; i++) {
                criarCartao(dados.results[i]);
            }
        }
    } catch (erro) {
        mostrarMensagem(mensagemBusca, "Não foi possível fazer a busca. Confira sua conexão e a chave da API.", "erro");
        console.log(erro);
    }
}


formularioBusca.addEventListener("submit", buscarJogos);

// Cadastra um jogo escrito pelo usuário.
formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nome = document.querySelector("#nomeJogo").value.trim();
    const categoria = document.querySelector("#categoriaJogo").value.trim();

    if (nome === "" || categoria === "") {
        mostrarMensagem(mensagemCadastro, "Preencha os dois campos.", "erro");
    } else {
        const item = document.createElement("li");
        item.textContent = nome + " - " + categoria;
        listaJogos.appendChild(item);

        mostrarMensagem(mensagemCadastro, "Jogo cadastrado com sucesso!", "sucesso");
        formulario.reset();
    }
});

carregarCategorias();
