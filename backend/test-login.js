const axios = require('axios');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function testLogin() {
  const apiUrl = 'http://localhost:3000/api/v1/auth/login';
  const credentials = {
    email: 'admin@hrmanagement.com',
    password: 'admin123',
  };

  try {
    console.log('Testando login com:', credentials);
    const response = await axios.post(apiUrl, credentials, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Sucesso! Resposta do login:', response.data);
  } catch (error) {
    console.error('Erro no login:', error.response?.data || error.message);
  }
}

async function testPasswordHash() {
  const storedHash = '$2b$10$q1Z.47tDZjCpGvNZqFawy.ho9u5tFCpYKfM68CV6rEYV39hxqcZ3m'; // Hash gerado anteriormente
  const password = 'admin123';

  console.log('Verificando hash da senha...');
  const isMatch = await bcrypt.compare(password, storedHash);
  console.log('A senha "admin123" corresponde ao hash?', isMatch);

  if (!isMatch) {
    console.log('Gerando novo hash para a senha "admin123"...');
    const newHash = await bcrypt.hash(password, 10);
    console.log('Novo hash:', newHash);
    console.log('Atualize o campo password_hash no Supabase com este valor.');
  }
}

async function testRegister() {
  const apiUrl = 'http://localhost:3000/api/v1/auth/register';
  const registerData = {
    email: `test${Date.now()}@hrmanagement.com`,
    password: 'test123',
    name: 'Test User',
    role: 'employee',
    departmentId: 'd1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6',
    positionId: 'p1q2r3s4-t5u6-v7w8-x9y0-z1a2b3c4d5e6',
  };

  try {
    console.log('Testando registro com:', registerData);
    const response = await axios.post(apiUrl, registerData, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Sucesso! Resposta do registro:', response.data);
  } catch (error) {
    console.error('Erro no registro:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('=== Teste de Login ===');
  await testLogin();
  console.log('\n=== Teste de Hash ===');
  await testPasswordHash();
  console.log('\n=== Teste de Registro ===');
  await testRegister();
}

main().catch(console.error);