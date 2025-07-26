const bcrypt = require('bcrypt');

const hash = '$2b$10$q1Z.47tDZjCpGvNZqFawy.ho9u5tFCpYKfM68CV6rEYV39hxqcZ3m';
const senhaTestada = '123456'; // coloque aqui a senha que você quer testar

bcrypt.compare(senhaTestada, hash, function(err, result) {
  if (err) {
    console.error('Erro ao comparar:', err);
    return;
  }

  if (result) {
    console.log('✅ Senha correta!');
  } else {
    console.log('❌ Senha incorreta.');
  }
});
