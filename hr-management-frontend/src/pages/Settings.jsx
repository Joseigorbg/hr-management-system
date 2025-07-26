import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { toast } from 'sonner';
import { RefreshCw, Lock } from 'lucide-react'; // Re-added necessary icons

const BASE_URL = 'http://localhost:3000';

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
  </div>
);

const Settings = () => {
  const { t } = useTranslation();
  const [cardSettings, setCardSettings] = useState({
    [t('general_settings')]: [
      { key: 'system.company_name', value: 'GPR System Ltda', description: t('general_settings') },
      { key: 'system.fuso_horario', value: 'America/Sao_Paulo', description: t('fuso_horario') },
      { key: 'system.idioma', value: 'Português (Brasil)', description: t('idioma_padrao') },
    ],
    [t('system_notifications')]: [
      { key: 'notification.email_enabled', value: 'true', description: t('receber_atualizacoes_email') },
      { key: 'notification.push_enabled', value: 'false', description: t('notificacoes_push') },
      { key: 'notification.automated_reports', value: 'false', description: t('relatorios_automaticos') },
    ],
    [t('user_management')]: [
      { key: 'user.automatic_registration', value: 'false', description: t('registro_automatico') },
      { key: 'user.role_duplication', value: 'false', description: t('evitar_duplicacao_papeis') },
    ],
    [t('backup_security')]: [
      { key: 'security.automatic_backup', value: 'true', description: t('backup_automatico') },
      { key: 'security.last_backup', value: '15/05/2024 14:00', description: t('ultimo_backup') },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(t('session_expired'));
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  const fetchCardSettings = useCallback(async () => {
    if (!checkToken()) return;
    try {
      setIsLoading(true);
      const categories = ['system', 'notification', 'user', 'security'];
      const fetchedSettings = await Promise.all(
        categories.map(async (category) => {
          const response = await fetch(`${BASE_URL}/settings/category/${category}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            return [];
          }
          return response.ok ? data : [];
        })
      );

      const newSettings = {
        [t('general_settings')]: fetchedSettings[0].length ? fetchedSettings[0] : cardSettings[t('general_settings')],
        [t('system_notifications')]: fetchedSettings[1].length ? fetchedSettings[1] : cardSettings[t('system_notifications')],
        [t('user_management')]: fetchedSettings[2].length ? fetchedSettings[2] : cardSettings[t('user_management')],
        [t('backup_security')]: fetchedSettings[3].length ? fetchedSettings[3] : cardSettings[t('backup_security')],
      };
      setCardSettings(newSettings);
    } catch (err) {
      Sentry.captureException(err);
      console.error('Erro ao buscar configurações dos cards:', err);
      toast.error(t('error_loading_settings'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const updateSettingByKey = async (key, value, description = '', category = '') => {
    if (!checkToken()) return;
    try {
      const response = await fetch(`${BASE_URL}/settings/key/${key}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, description, category }),
      });
      const text = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(text);
      } catch {
        throw new Error(t('error_processing_response'));
      }
      if (!response.ok) {
        throw new Error(responseData.message || t('error_updating_setting'));
      }
      toast.success(t('setting_updated'));
    } catch (err) {
      Sentry.captureException(err);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: 'development',
      });
    }
    fetchCardSettings();
  }, [fetchCardSettings]);

  const handlePermissionManagement = async () => {
    if (!checkToken()) return;
    try {
      const response = await fetch(`${BASE_URL}/settings/permissions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(t('error_processing_response'));
      }
      if (!response.ok) throw new Error(data?.message || t('error_loading_permissions'));
      toast.info(`${t('permissions_available')}: ${data.map(p => p.name).join(', ')}`);
    } catch (err) {
      Sentry.capture(err);
      toast.error(err.message);
    }
  };

  const handleBackup = async () => {
    if (!checkToken()) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/settings/backup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(t('error_processing_response'));
      }
      if (!response.ok) {
        throw new Error(data?.message || t('error_processing_response'));
      }
      toast.success(data.message || t('backup_success'));
    } catch (err) {
      Sentry.capture(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (file) => {
    if (!checkToken()) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('backup', file);
      const response = await fetch(`${BASE_URL}/settings/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(t('error_processing_response'));
      }
      if (!response.ok) throw new Error(data?.message || t('error_restoring_backup'));
      toast.success(t('restore_success'));
      fetchCardSettings();
    } catch (err) {
      Sentry.capture(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {isLoading && <LoadingSpinner />}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('settings')}</h1>
        <p className="text-muted-foreground">{t('configure_preferences')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{t('general_settings')}</CardTitle>
          </CardHeader>
          <CardContent>
            {cardSettings[t('general_settings')].map((setting, index) => (
              <div key={setting.key} className="mb-4">
                <Label>{setting.description}</Label>
                <Input
                  value={setting.value}
                  onChange={(e) => {
                    const newSettings = [...cardSettings[t('general_settings')]];
                    newSettings[index].value = e.target.value;
                    setCardSettings((prev) => ({
                      ...prev,
                      [t('general_settings')]: newSettings,
                    }));
                    updateSettingByKey(setting.key, e.target.value, setting.description, 'system');
                  }}
                  className="bg-input text-foreground border-border mt-1"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{t('system_notifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            {cardSettings[t('system_notifications')].map((setting, index) => (
              <div key={setting.key} className="mb-4 flex items-center justify-between">
                <Label>{setting.description}</Label>
                <Switch
                  checked={setting.value === 'true'}
                  onCheckedChange={(checked) => {
                    const newSettings = [...cardSettings[t('system_notifications')]];
                    newSettings[index].value = checked ? 'true' : 'false';
                    setCardSettings((prev) => ({
                      ...prev,
                      [t('system_notifications')]: newSettings,
                    }));
                    updateSettingByKey(setting.key, checked ? 'true' : 'false', setting.description, 'notification');
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{t('user_management')}</CardTitle>
          </CardHeader>
          <CardContent>
            {cardSettings[t('user_management')].map((setting, index) => (
              <div key={setting.key} className="mb-4 flex items-center justify-between">
                <Label>{setting.description}</Label>
                <Switch
                  checked={setting.value === 'true'}
                  onCheckedChange={(checked) => {
                    const newSettings = [...cardSettings[t('user_management')]];
                    newSettings[index].value = checked ? 'true' : 'false';
                    setCardSettings((prev) => ({
                      ...prev,
                      [t('user_management')]: newSettings,
                    }));
                    updateSettingByKey(setting.key, checked ? 'true' : 'false', setting.description, 'user');
                  }}
                />
              </div>
            ))}
            <Button
              onClick={handlePermissionManagement}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
            >
              <Lock className="mr-2 h-4 w-4" /> {t('manage_permissions')}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{t('backup_security')}</CardTitle>
          </CardHeader>
          <CardContent>
            {cardSettings[t('backup_security')].map((setting, index) => (
              <div key={setting.key} className="mb-4 flex items-center justify-between">
                <Label>{setting.description}</Label>
                {setting.key === 'security.last_backup' ? (
                  <span>{setting.value}</span>
                ) : (
                  <Switch
                    checked={setting.value === 'true'}
                    onCheckedChange={(checked) => {
                      const newSettings = [...cardSettings[t('backup_security')]];
                      newSettings[index].value = checked ? 'true' : 'false';
                      setCardSettings((prev) => ({
                        ...prev,
                        [t('backup_security')]: newSettings,
                      }));
                      updateSettingByKey(setting.key, checked ? 'true' : 'false', setting.description, 'security');
                    }}
                  />
                )}
              </div>
            ))}
            <div className="flex space-x-2 mt-4">
              <Button
                onClick={handleBackup}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> {t('perform_backup')}
              </Button>
              <Input
                type="file"
                accept=".json"
                onChange={(e) => handleRestore(e.target.files[0])}
                className="bg-input text-foreground border-border"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;