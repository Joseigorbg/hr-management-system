export const getAuthToken = () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token recuperado do localStorage:', token ? 'Presente' : 'Nenhum token encontrado');
    return token;
  } catch (error) {
    console.error('Erro ao recuperar token do localStorage:', error.message);
    return null;
  }
};

export const getUserIdFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const userId = decoded.sub || decoded.userId || decoded.id;
    console.log('UserId extraído do token:', userId);
    return userId;
  } catch (error) {
    console.error('Erro ao decodificar token para obter userId:', error);
    return null;
  }
};

export const setAuthData = (token, userId) => {
  localStorage.setItem('token', token);
  if (userId) {
    console.log('UserId definido a partir do token:', userId);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};