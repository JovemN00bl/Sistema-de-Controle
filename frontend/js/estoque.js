// frontend/js/estoque.js

const productListDiv = document.getElementById('productList');
const addProductModal = document.getElementById('addProductModal');
const openAddProductModalBtn = document.getElementById('openAddProductModal');
const productForm = document.getElementById('productForm');

const addMovementModal = document.getElementById('addMovementModal');
const movementForm = document.getElementById('movementForm');
const movementProductSelect = document.getElementById('movementProduct');

let allProducts = []; // Armazena todos os produtos para uso em selects

// Função para carregar e exibir os produtos
async function loadProducts() {
    productListDiv.innerHTML = 'Carregando produtos...';
    try {
        allProducts = await getProducts(); // Assume que getProducts vem de api.js
        productListDiv.innerHTML = ''; // Limpa antes de adicionar
        if (allProducts.length === 0) {
            productListDiv.innerHTML = '<p>Nenhum produto cadastrado.</p>';
            return;
        }
        allProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'item-card';
            productCard.innerHTML = `
                <div><span>Nome:</span> ${product.nome}</div>
                <div><span>SKU:</span> ${product.sku || 'N/A'}</div>
                <div><span>Preço Venda:</span> R$ ${parseFloat(product.preco_venda).toFixed(2)}</div>
                <div><span>Estoque:</span> ${product.quantidade_em_estoque} ${product.unidade_medida}</div>
                <button class="movement-btn" data-product-id="${product.id}" data-product-name="${product.nome}">Movimentar</button>
                `;
            productListDiv.appendChild(productCard);
        });
        setupMovementButtons(); // Adiciona event listeners aos botões de movimentar
        populateMovementProductSelect(); // Popula o select do modal de movimento
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        productListDiv.innerHTML = '<p>Erro ao carregar produtos.</p>';
    }
}

// Função para popular o select de produtos no modal de movimento
function populateMovementProductSelect() {
    movementProductSelect.innerHTML = '<option value="">Selecione um produto</option>';
    allProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.nome} (Estoque: ${product.quantidade_em_estoque})`;
        movementProductSelect.appendChild(option);
    });
}

// Adiciona event listeners aos botões de movimentar
function setupMovementButtons() {
    document.querySelectorAll('.movement-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId;
            const productName = event.target.dataset.productName;
            movementProductSelect.value = productId; // Seleciona o produto no modal
            addMovementModal.style.display = 'block';
        });
    });
}

// Event listener para abrir o modal de adicionar produto
openAddProductModalBtn.addEventListener('click', () => {
    addProductModal.style.display = 'block';
    productForm.reset(); // Limpa o formulário
});

// Event listener para o formulário de novo produto
productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const productData = {
        nome: document.getElementById('productName').value,
        sku: document.getElementById('productSku').value,
        descricao: document.getElementById('productDescription').value,
        preco_custo: parseFloat(document.getElementById('productCost').value),
        preco_venda: parseFloat(document.getElementById('productSale').value),
        unidade_medida: document.getElementById('productUnit').value,
    };
    try {
        await createProduct(productData); // Assume createProduct vem de api.js
        addProductModal.style.display = 'none';
        loadProducts(); // Recarrega a lista de produtos
    } catch (error) {
        // Erro já tratado em api.js, apenas logamos aqui
        console.error('Falha ao adicionar produto:', error);
    }
});

// Event listener para o formulário de movimento de estoque
movementForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const movementData = {
        produto: parseInt(document.getElementById('movementProduct').value),
        tipo_movimento: document.getElementById('movementType').value,
        quantidade: parseInt(document.getElementById('movementQuantity').value),
        observacao: document.getElementById('movementObs').value,
    };
    try {
        await createMovement(movementData); // Assume createMovement vem de api.js
        addMovementModal.style.display = 'none';
        loadProducts(); // Recarrega a lista de produtos (para ver a nova quantidade)
    } catch (error) {
        console.error('Falha ao registrar movimento:', error);
    }
});

// Exportar loadProducts para ser chamado globalmente (por index.html)
// window.loadProducts = loadProducts; // Já está sendo chamado no index.html