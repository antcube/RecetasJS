// Se agrega un evento de escucha a la ventana para iniciar la aplicación cuando se carga la página
window.addEventListener('load', iniciarApp);

function iniciarApp() {
    // Selecciona los elementos necesarios del DOM
    const resultado = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');
    const modal = new bootstrap.Modal('#modal', {});
    const favoritoDiv = document.querySelector('.favoritos');

    // Si el elemento selectCategorias existe, obtiene las categorías y agrega un evento de escucha
    if(selectCategorias) {
        obtenerCategorias();
        selectCategorias.addEventListener('change', seleccionarCategoria)
    }

    // Si el elemento favoritoDiv existe, obtiene los favoritos
    if(favoritoDiv) {
        obtenerFavoritos();
    }

    // Función para obtener las categorías de la API
    function obtenerCategorias() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories))
    }

    // Función para mostrar las categorías en el select
    function mostrarCategorias(categorias = []) {
        categorias.forEach(categoria => {
            const { strCategory } = categoria;

            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;

            selectCategorias.appendChild(option);
        })
    }

    // Función para seleccionar una categoría y obtener las recetas correspondientes
    function seleccionarCategoria(e) {
        // Obtiene la categoría seleccionada
        const categoria = e.target.value

        // Construye la URL para obtener las recetas de la categoría seleccionada
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        // Realiza la petición a la API
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))
    }

    // Función para mostrar las recetas en el DOM
    function mostrarRecetas(recetas = []) {
        // Limpia el contenido anterior
        limpiarHTML(resultado);

        // Crea un elemento heading para mostrar el título de la receta
        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        // Si hay recetas, muestra 'Resultados', si no, muestra 'No hay resultados, intenta con otra categoría'
        heading.textContent = recetas.length ? 'Resultados' : 'No hay resultados, intenta con otra categoría';
        resultado.append(heading);

        // Itera sobre las recetas
        recetas.forEach( receta => {
            // Extrae los datos necesarios de la receta
            const { idMeal, strMeal, strMealThumb} = receta;

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;
            recetaImagen.src = strMealThumb ?? receta.imagen;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';
            recetaButton.addEventListener('click', () => {
                seleccionarReceta(idMeal ?? receta.id);
            })

            recetaCardBody.append(recetaHeading);
            recetaCardBody.append(recetaButton);

            recetaCard.append(recetaImagen);
            recetaCard.append(recetaCardBody);

            recetaContenedor.append(recetaCard);

            resultado.append(recetaContenedor);
        })

    }

    // Función para seleccionar una receta y obtener los detalles de la receta
    function seleccionarReceta(id) {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]))
    }

    // Función para mostrar los detalles de la receta en un modal
    function mostrarRecetaModal(receta) {
        // Extrae los datos necesarios de la receta
        const { idMeal, strMeal, strMealThumb, strInstructions } = receta;

        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;

        // Limpia el contenido anterior del cuerpo del modal
        limpiarHTML(modalBody);

        const img = document.createElement('IMG');
        img.classList.add('img-fluid', 'mb-4');
        img.src = strMealThumb;
        img.alt = `Imagen de la receta ${strMeal}`;

        const h3Instrucciones = document.createElement('H3');
        h3Instrucciones.textContent = 'Instrucciones';

        const p = document.createElement('P');
        p.textContent = strInstructions;

        const h3Ingredientes = document.createElement('H3');
        h3Ingredientes.textContent = 'Ingredientes y Cantidades';

        modalBody.append(img);
        modalBody.append(h3Instrucciones);
        modalBody.append(p);
        modalBody.append(h3Ingredientes);

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        // Itera sobre los ingredientes de la receta
        for(let i = 1; i <= 20; i++) {
            if(receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]

                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item')
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;
                
                listGroup.append(ingredienteLi);
            }
        }
        modalBody.append(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHTML(modalFooter);

        // Crea un botón para agregar o eliminar la receta de los favoritos
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeFavoritoStorage(idMeal) ? 'Eliminar de Favoritos' : 'Agregar a Favoritos';

        // Agrega un evento de escucha al botón para agregar o eliminar la receta de los favoritos cuando se hace clic en él
        btnFavorito.addEventListener('click', () => {

            // Si la receta ya está en los favoritos, la elimina
            if(existeFavoritoStorage(idMeal)) {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Agregar a Favoritos';
                mostrarToast('Receta eliminada de favoritos');
                return;
            }

            // Si la receta no está en los favoritos, la agrega
            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                imagen: strMealThumb
            })
            btnFavorito.textContent = 'Eliminar de Favoritos';
            mostrarToast('Receta agregada a favoritos');
        })

        // Crea un botón para cerrar el modal
        const btnCerrar = document.createElement('BUTTON');
        btnCerrar.classList.add('btn', 'btn-secondary', 'col');
        btnCerrar.textContent = 'Cerrar';
        btnCerrar.addEventListener('click', () => {
            modal.hide();
        })

        modalFooter.append(btnFavorito);
        modalFooter.append(btnCerrar);

        // Muestra el modal
        modal.show()
    }

    // Función para agregar una receta a los favoritos
    function agregarFavorito(receta) {
        // Obtiene los favoritos actuales del almacenamiento local. Si no hay ninguno, se usa un array vacío
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        // Agrega la nueva receta a los favoritos y guarda la lista actualizada en el almacenamiento local
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }

    // Esta función elimina un favorito basado en su id
    function eliminarFavorito(id) {
        // Obtiene los favoritos del almacenamiento local y los convierte a un array
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        // Filtra los favoritos para excluir el que tiene el id proporcionado
        const nuevosFavoritos = favoritos.filter( favorito => favorito.id !== id);
        // Guarda los nuevos favoritos en el almacenamiento local
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
        
        // Si existe favoritoDiv, muestra las recetas y oculta el modal
        if(favoritoDiv) {
            obtenerFavoritos();
            modal.hide();
        }
    }

    // Esta función muestra un mensaje en un toast
    function mostrarToast(mensaje) {
        // Crea un nuevo toast
        const toast = new bootstrap.Toast('#toast');
        // Obtiene el cuerpo del toast
        const toastBody = document.querySelector(".toast-body");

        // Establece el mensaje del toast
        toastBody.textContent = mensaje;
        // Muestra el toast
        toast.show();
    }

    // Esta función verifica si un favorito existe en el almacenamiento local basado en su id
    function existeFavoritoStorage(id) {
        // Obtiene los favoritos del almacenamiento local y los convierte a un array
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        // Retorna true si algún favorito tiene el id proporcionado
        return favoritos.some(favorito => favorito.id === id);
    }

    // Esta función obtiene los favoritos del almacenamiento local
    function obtenerFavoritos() {
        // Obtiene los favoritos del almacenamiento local y los convierte a un array
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        // Si hay favoritos, muestra las recetas y termina la ejecución de la función
        if(favoritos.length) {
            mostrarRecetas(favoritos);
            return;
        }

        // Si no hay favoritos, crea un nuevo elemento de párrafo y lo añade a favoritoDiv
        const noFavoritos = document.createElement('P');
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        noFavoritos.textContent = 'No tienes recetas favoritas, comienza a agregarlas !!!';
        favoritoDiv.append(noFavoritos);
    }

    // Esta función limpia el contenido HTML de un selector
    function limpiarHTML(selector) {
        // Mientras el selector tenga un primer hijo, lo elimina
        while(selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }
}
