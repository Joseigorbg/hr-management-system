import * as Sentry from '@sentry/react';

const BASE_URL = 'http://localhost:3000';

const defaultCardSettings = {
  general_settings: [
    { key: 'system.company_name', value: 'GPR System Ltda', description: 'general_settings' },
    { key: 'system.fuso_horario', value: 'America/Sao_Paulo', description: 'fuso_horario' },
    { key: 'system.idioma', value: 'Português (Brasil)', description: 'idioma_padrao' },
  ],
  system_notifications: [
    { key: 'notification.email_enabled', value: 'true', description: 'receber_atualizacoes_email' },
    { key: 'notification.push_enabled', value: 'false', description: 'notificacoes_push' },
    { key: 'notification.automated_reports', value: 'false', description: 'relatorios_automaticos' },
  ],
  user_management: [
    { key: 'user.automatic_registration', value: 'false', description: 'registro_automatico' },
    { key: 'user.role_duplication', value: 'false', description: 'evitar_duplicacao_papeis' },
  ],
  backup_security: [
    { key: 'security.automatic_backup', value: 'true', description: 'backup_automatico' },
    { key: 'security.last_backup', value: '15/05/2024 14:00', description: 'ultimo_backup' },
  ],
};

const processError = (error, defaultMessage, t) => {
  const message = error.response?.data?.message || error.message || t(defaultMessage);
  Sentry.captureException(error);
  return new Error(message);
};

const checkToken = (t) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error(t('session_expired'));
  }
  return token;
};

const settingsService = {
  validateSetting(data) {
    if (!data?.key) return t('key_required');
    if (!data?.value) return t('value_required');
    return null;
  },

  async fetchSettings(page, category, search, t) {
    const token = checkToken(t);
    try {
      const url = `${BASE_URL}/settings?page=${page}&limit=10&category=${category === 'all' ? '' : category}&search=${encodeURIComponent(search)}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || t('error_loading_settings'));
      return { data: data.data || [], totalPages: data.meta?.totalPages || 1 };
    } catch (error) {
      throw processError(error, 'error_loading_settings', t);
    }
  },

  async fetchCardSettings(t) {
    const token = checkToken(t);
    try {
      const categories = ['system', 'notification', 'user', 'security'];
      const fetchedSettings = await Promise.all(
        categories.map(async (category) => {
          const response = await fetch(`${BASE_URL}/settings/category/${category}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          return response.ok && data.length ? data : defaultCardSettings[t(category)];
        })
      );
      return {
        [t('general_settings')]: fetchedSettings[0],
        [t('system_notifications')]: fetchedSettings[1],
        [t('user_management')]: fetchedSettings[2],
        [t('backup_security')]: fetchedSettings[3],
      };
    } catch (error) {
      throw processError(error, 'error_loading_settings', t);
    }
  },

  async fetchCategories(t) {
    const token = checkToken(t);
    try {
      const response = await fetch(`${BASE_URL}/settings/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || t('error_loading_categories'));
      return data;
    } catch (error) {
      throw processError(error, 'error_loading_categories', t);
    }
  },

  async createSetting(data, t) {
    const token = checkToken(t);
    try {
      const response = await fetch(`${BASE_URL}/settings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || t('error_creating_setting'));
      return responseData;
    } catch (error) {
      throw processError(error, 'error_creating_setting', t);
    }
  },

  async updateSetting(id, data, t) {
    const token = checkToken(t);
    try {
      const response = await fetch(`${BASE_URL}/settings/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || t('error_updating_setting'));
      return responseData;
    } catch (error) {
      throw processError(error, 'error_updating_setting', t);
    }
  },

  async updateSettingByKey(key, value, description, category, t) {
    const token = checkToken(t);
    try {
      const response = await fetch(`${BASE_URL}/settings/key/${key}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, description, category }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        if (response.status === 404) {
          return await settingsService.createSetting({ key, value, description, category }, t);
        }
        throw new Error(responseData.message || t('error_updating_setting'));
      }
      return responseData;
    } catch (error) {
      throw processError(error, 'error_updating_setting', t);
    }
  },

  async deleteSetting(id, t) {
    const token = checkToken(t);
    try {
      const response = await fetch(`${BASE_URL}/settings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || t('error_deleting_setting'));
      return responseData;
    } catch (error) {
      throw processError(error, 'error_deleting_setting', t);
    }
  },

  async backup(t) {
    const token = checkToken(t);
    try {
      const response = await fetch(`${BASE_URL}/settings/backup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || t('error_processing'));
      return data.message;
    } catch (error) {
      throw processError(error, 'error_processing', t);
    }
  },

  async restore(file, t) {
    const token = checkToken(t);
    try {
      const formData = new FormData();
      formData.append('backup', file);
      const response = await fetch(`${BASE_URL}/settings/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || t('error_restoring_backup'));
      return data;
    } catch (error) {
      throw processError(error, 'error_restoring_backup', t);
    }
  },

  async getPermissions(t) {
    const token = checkToken(t);
    try {
      const response = await fetch(`${BASE_URL}/settings/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || t('error_loading_permissions'));
      return data.map(p => p.name);
    } catch (error) {
      throw processError(error, 'error_loading_permissions', t);
    }
  },
};

export default settingsService;