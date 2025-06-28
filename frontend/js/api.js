// frontend/js/api.js

// URL base da sua API Django
const API_BASE_URL = 'http://127.0.0.1:8000/api/';

// --- Funções para Módulo de Estoque ---

async function getProducts() {
    try {
        const response = await axios.get(`${API_BASE_URL}estoque/produtos/`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        alert('Erro ao carregar produtos. Verifique o console.');
        return [];
    }
}

async function createProduct(productData) {
    try {
        const response = await axios.post(`${API_BASE_URL}estoque/produtos/`, productData);
        alert('Produto criado com sucesso!');
        return response.data;
    } catch (error) {
        console.error('Erro ao criar produto:', error.response ? error.response.data : error.message);
        alert('Erro ao criar produto: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
        throw error; // Re-lança o erro para ser capturado pela UI
    }
}

async function createMovement(movementData) {
    try {
        const response = await axios.post(`${API_BASE_URL}estoque/movimentos/`, movementData);
        alert('Movimento de estoque registrado com sucesso!');
        return response.data;
    } catch (error) {
        console.error('Erro ao registrar movimento:', error.response ? error.response.data : error.message);
        alert('Erro ao registrar movimento: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
        throw error;
    }
}

// --- Funções para Módulo de Vendas ---

async function getClients() {
    try {
        const response = await axios.get(`${API_BASE_URL}vendas/clientes/`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        alert('Erro ao carregar clientes. Verifique o console.');
        return [];
    }
}

async function createClient(clientData) {
    try {
        const response = await axios.post(`${API_BASE_URL}vendas/clientes/`, clientData);
        alert('Cliente criado com sucesso!');
        return response.data;
    } catch (error) {
        console.error('Erro ao criar cliente:', error.response ? error.response.data : error.message);
        alert('Erro ao criar cliente: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
        throw error;
    }
}

async function getOrders() {
    try {
        const response = await axios.get(`${API_BASE_URL}vendas/pedidos/`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        alert('Erro ao carregar pedidos. Verifique o console.');
        return [];
    }
}

async function createOrder(orderData) {
    try {
        const response = await axios.post(`${API_BASE_URL}vendas/pedidos/`, orderData);
        alert('Pedido criado com sucesso!');
        return response.data;
    } catch (error) {
        console.error('Erro ao criar pedido:', error.response ? error.response.data : error.message);
        alert('Erro ao criar pedido: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
        throw error;
    }
}