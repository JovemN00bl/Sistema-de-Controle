// frontend/js/vendas.js

const clientListDiv = document.getElementById('clientList');
const orderListDiv = document.getElementById('orderList');

const addClientModal = document.getElementById('addClientModal');
const openAddClientModalBtn = document.getElementById('openAddClientModal');
const clientForm = document.getElementById('clientForm');

const addOrderModal = document.getElementById('addOrderModal');
const openAddOrderModalBtn = document.getElementById('openAddOrderModal');
const orderForm = document.getElementById('orderForm');
const orderClientSelect = document.getElementById('orderClient');
const orderItemsContainer = document.getElementById('orderItemsContainer');
const addItemToOrderBtn = document.getElementById('addItemToOrder');

let allClients = []; // Armazena todos os clientes
// allProducts já está em estoque.js e é globalmente acessível se incluído antes

// Função para carregar e exibir os clientes
async function loadClients() {
    clientListDiv.innerHTML = 'Carregando clientes...';
    try {
        allClients = await getClients(); // Assume getClients vem de api.js
        clientListDiv.innerHTML = '';
        if (allClients.length === 0) {
            clientListDiv.innerHTML = '<p>Nenhum cliente cadastrado.</p>';
            return;
        }
        allClients.forEach(client => {
            const clientCard = document.createElement('div');
            clientCard.className = 'item-card';
            clientCard.innerHTML = `
                <div><span>Nome:</span> ${client.nome}</div>
                <div><span>CPF/CNPJ:</span> ${client.cpf_cnpj || 'N/A'}</div>
                <div><span>Email:</span> ${client.email || 'N/A'}</div>
                `;
            clientListDiv.appendChild(clientCard);
        });
        populateOrderClientSelect(); // Popula o select de clientes no modal de pedido
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        clientListDiv.innerHTML = '<p>Erro ao carregar clientes.</p>';
    }
}

// Função para popular o select de clientes no modal de pedido
function populateOrderClientSelect() {
    orderClientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
    allClients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.nome;
        orderClientSelect.appendChild(option);
    });
}

// Função para carregar e exibir os pedidos
async function loadOrders() {
    orderListDiv.innerHTML = 'Carregando pedidos...';
    try {
        const orders = await getOrders(); // Assume getOrders vem de api.js
        orderListDiv.innerHTML = '';
        if (orders.length === 0) {
            orderListDiv.innerHTML = '<p>Nenhum pedido realizado.</p>';
            return;
        }
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'item-card';
            const orderDate = new Date(order.data_pedido).toLocaleDateString('pt-BR');
            const orderItemsHtml = order.itens.map(item => `
                <li>${item.quantidade}x ${item.produto_nome} (R$ ${parseFloat(item.preco_unitario).toFixed(2)})</li>
            `).join('');

            orderCard.innerHTML = `
                <div><span>Pedido #:</span> ${order.id}</div>
                <div><span>Cliente:</span> ${order.cliente_nome || (allClients.find(c => c.id === order.cliente)?.nome || 'Desconhecido')}</div>
                <div><span>Data:</span> ${orderDate}</div>
                <div><span>Status:</span> ${order.status}</div>
                <div><span>Total:</span> R$ ${parseFloat(order.valor_total).toFixed(2)}</div>
                <div>
                    <span>Itens:</span>
                    <ul>${orderItemsHtml}</ul>
                </div>
            `;
            orderListDiv.appendChild(orderCard);
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        orderListDiv.innerHTML = '<p>Erro ao carregar pedidos.</p>';
    }
}

// Função para adicionar um novo item ao formulário de pedido
let itemCounter = 0;
function addOrderItemField() {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.innerHTML = `
        <label for="itemProduct${itemCounter}">Produto:</label>
        <select class="item-product" id="itemProduct${itemCounter}" required></select>
        <label for="itemQuantity${itemCounter}">Quantidade:</label>
        <input type="number" class="item-quantity" id="itemQuantity${itemCounter}" required min="1">
        <button type="button" class="remove-item-btn">Remover</button>
    `;
    orderItemsContainer.appendChild(itemDiv);

    // Popula o select de produtos para o novo item
    const newItemProductSelect = itemDiv.querySelector(`.item-product`);
    populateProductSelectForOrderItem(newItemProductSelect);

    // Adiciona evento para remover item
    itemDiv.querySelector('.remove-item-btn').addEventListener('click', () => {
        itemDiv.remove();
    });

    itemCounter++;
}

// Função para popular o select de produtos em um item de pedido
function populateProductSelectForOrderItem(selectElement) {
    selectElement.innerHTML = '<option value="">Selecione um produto</option>';
    // 'allProducts' é global e deve vir de estoque.js
    if (typeof allProducts !== 'undefined' && allProducts.length > 0) {
        allProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.nome} (Estoque: ${product.quantidade_em_estoque})`;
            selectElement.appendChild(option);
        });
    } else {
         // Tenta carregar produtos se ainda não estiverem carregados
        getProducts().then(products => {
            allProducts = products; // Atualiza a variável global
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.nome} (Estoque: ${product.quantidade_em_estoque})`;
                selectElement.appendChild(option);
            });
        }).catch(error => {
            console.error("Erro ao carregar produtos para item de pedido:", error);
        });
    }
}

// Event listeners para vendas
openAddClientModalBtn.addEventListener('click', () => {
    addClientModal.style.display = 'block';
    clientForm.reset();
});

clientForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const clientData = {
        nome: document.getElementById('clientName').value,
        cpf_cnpj: document.getElementById('clientCpfCnpj').value,
        email: document.getElementById('clientEmail').value,
        telefone: document.getElementById('clientPhone').value,
        endereco: document.getElementById('clientAddress').value,
    };
    try {
        await createClient(clientData);
        addClientModal.style.display = 'none';
        loadClients();
    } catch (error) {
        console.error('Falha ao adicionar cliente:', error);
    }
});

openAddOrderModalBtn.addEventListener('click', () => {
    addOrderModal.style.display = 'block';
    orderForm.reset();
    orderItemsContainer.innerHTML = ''; // Limpa itens anteriores
    itemCounter = 0; // Reseta o contador
    addOrderItemField(); // Adiciona o primeiro item de pedido automaticamente
    populateOrderClientSelect(); // Garante que a lista de clientes esteja atualizada
    // allProducts é global, então populateProductSelectForOrderItem já a utiliza.
});

addItemToOrderBtn.addEventListener('click', addOrderItemField);

orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const clienteId = parseInt(document.getElementById('orderClient').value);
    const itens = [];

    document.querySelectorAll('.order-item').forEach(itemDiv => {
        const productId = parseInt(itemDiv.querySelector('.item-product').value);
        const quantity = parseInt(itemDiv.querySelector('.item-quantity').value);

        if (productId && quantity > 0) {
            itens.push({
                produto: productId,
                quantidade: quantity
            });
        }
    });

    if (itens.length === 0) {
        alert("Adicione pelo menos um item ao pedido.");
        return;
    }

    const orderData = {
        cliente: clienteId,
        itens: itens
    };

    try {
        await createOrder(orderData);
        addOrderModal.style.display = 'none';
        loadOrders(); // Recarrega a lista de pedidos
        loadProducts(); // Recarrega produtos para atualizar o estoque
    } catch (error) {
        console.error('Falha ao criar pedido:', error);
    }
});

// Exportar loadClients e loadOrders para serem chamados globalmente (por index.html)
// window.loadClients = loadClients; // Já está sendo chamado no index.html
// window.loadOrders = loadOrders; // Já está sendo chamado no index.html