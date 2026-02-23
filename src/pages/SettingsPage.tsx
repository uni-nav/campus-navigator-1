import { useState } from 'react';
import { Server, Save, CheckCircle, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { setApiUrl, getApiUrl, getAdminToken, setAdminToken, healthCheck, navigationApi } from '@/lib/api/client';
import type { MapAuditResponse } from '@/lib/api/types';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SettingsPage() {
  const {
    apiUrl,
    setApiUrl: setStoreApiUrl,
    isApiConnected,
    setIsApiConnected,
  } = useAppStore();

  const [localApiUrl, setLocalApiUrl] = useState(apiUrl || getApiUrl());
  const [adminToken, setAdminTokenState] = useState(getAdminToken());
  const [testing, setTesting] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<MapAuditResponse | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      // Temporarily set the URL
      setApiUrl(localApiUrl);
      const result = await healthCheck();
      setIsApiConnected(result);

      if (result) {
        toast.success('API ulanishi muvaffaqiyatli');
      } else {
        toast.error('API bilan ulanib bo\'lmadi');
      }
    } catch (error) {
      toast.error('Ulanishda xato');
      setIsApiConnected(false);
    } finally {
      setTesting(false);
    }
  };

  const handleSaveApiUrl = () => {
    setApiUrl(localApiUrl);
    setStoreApiUrl(localApiUrl);
    toast.success('API manzili saqlandi');
    handleTestConnection();
  };

  const handleSaveAdminToken = () => {
    setAdminToken(adminToken);
    toast.success('Admin token saqlandi');
  };

  const handleAudit = async () => {
    setAuditLoading(true);
    try {
      const result = await navigationApi.audit();
      setAuditResult(result);
      toast.success('Map audit tayyor');
    } catch (error) {
      toast.error("Map auditda xato");
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl animate-fade-in">
      <PageHeader
        title="Sozlamalar"
        description="API va qurilma sozlamalari"
        className="mb-8"
      />

      <div className="space-y-6">
        {/* API Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">API sozlamalari</h2>
              <p className="text-sm text-muted-foreground">Backend server manzili</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>API manzili</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="http://localhost:8000"
                  aria-label="API manzili"
                  value={localApiUrl}
                  onChange={(e) => setLocalApiUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="w-full sm:w-auto"
                >
                  {testing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              {isApiConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">Ulangan</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">Ulanmagan</span>
                </>
              )}
            </div>

            <Button onClick={handleSaveApiUrl} className="w-full gap-2">
              <Save className="w-4 h-4" />
              Saqlash
            </Button>

            <div className="space-y-2 pt-2">
              <Label>Admin token</Label>
              <Input
                type="password"
                placeholder="Bearer token"
                aria-label="Admin token"
                value={adminToken}
                onChange={(e) => setAdminTokenState(e.target.value)}
              />
              <Button onClick={handleSaveAdminToken} variant="outline" className="w-full gap-2">
                <Save className="w-4 h-4" />
                Tokenni saqlash
              </Button>
            </div>
          </div>
        </Card>

        {/* Map Audit */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Map Audit</h2>
              <p className="text-sm text-muted-foreground">
                Qavatlararo bog'lanishlar va uzilishlarni tekshirish
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleAudit}
              className="w-full gap-2"
              disabled={!isApiConnected || auditLoading}
            >
              {auditLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Tekshirish
            </Button>

            {auditResult && (
              <div className="space-y-4 rounded-lg bg-muted p-4 text-sm">
                <div className="grid grid-cols-2 gap-3 font-medium">
                  <div>Qavatlar: {auditResult.summary.floors}</div>
                  <div>Nuqtalar: {auditResult.summary.waypoints}</div>
                  <div>Bog'lanishlar: {auditResult.summary.connections}</div>
                  <div className={auditResult.summary.components > 1 ? "text-amber-600" : ""}>
                    Graf soni: {auditResult.summary.components}
                  </div>
                  <div className={(auditResult.summary.unattached_waypoints || 0) > 0 ? "text-destructive" : ""}>
                    Biriktirilmagan nuqtalar: {auditResult.summary.unattached_waypoints || 0}
                  </div>
                  <div className="text-primary">Vertikal bog'lanishlar: {auditResult.summary.vertical_connections || 0}</div>
                </div>

                {auditResult.components && auditResult.components.length > 1 && (
                  <div className="p-3 bg-amber-500/10 rounded-md border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                    <p className="font-semibold mb-1">⚠️ Xaritada {auditResult.components.length} ta alohida graf mavjud (barcha nuqtalar o'zaro tutashmagan):</p>
                    <ul className="list-disc pl-4 space-y-1 mt-2">
                      {auditResult.components.map(comp => (
                        <li key={comp.component_id}>
                          Graf {comp.component_id}: {comp.waypoint_count} ta nuqta (Qavatlar: {comp.floor_numbers.join(', ')})
                          {comp.waypoint_count <= 5 && comp.waypoint_ids && comp.waypoint_ids.length > 0 && (
                            <span className="block mt-0.5 opacity-80 text-[10px] font-mono">
                              Nuqta IDlari: {comp.waypoint_ids.join(', ')}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {auditResult.summary.disconnected_floors && auditResult.summary.disconnected_floors.length > 0 && (
                  <div className="text-amber-700 dark:text-amber-400">
                    <span className="font-semibold">Uzilgan qavatlar:</span>{' '}
                    {auditResult.summary.disconnected_floors
                      .map((f) => f.name || `ID ${f.id}`)
                      .join(', ')}
                  </div>
                )}

                {auditResult.summary.floors_with_no_waypoints && auditResult.summary.floors_with_no_waypoints.length > 0 && (
                  <div className="text-amber-700 dark:text-amber-400">
                    <span className="font-semibold">Nuqtasiz qavatlar:</span>{' '}
                    {auditResult.summary.floors_with_no_waypoints
                      .map((f) => f.name || `ID ${f.id}`)
                      .join(', ')}
                  </div>
                )}

                {((auditResult.summary.legacy_one_way_links || 0) > 0 ||
                  (auditResult.summary.stairs_without_vertical_links || 0) > 0) && (
                    <div className="text-destructive font-medium">
                      Bir yo'nalish linklar: {auditResult.summary.legacy_one_way_links || 0} •
                      Vertikal link yo'q: {auditResult.summary.stairs_without_vertical_links || 0}
                    </div>
                  )}

                {auditResult.unattached_waypoints && auditResult.unattached_waypoints.length > 0 && (
                  <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20 text-xs">
                    <p className="font-semibold text-destructive mb-1">Biriktirilmagan nuqtalar:</p>
                    <ul className="list-disc pl-4 space-y-1 text-destructive/90 max-h-32 overflow-y-auto mt-2">
                      {auditResult.unattached_waypoints.map(wp => (
                        <li key={wp.waypoint_id}>
                          {wp.type} - {wp.label || wp.waypoint_id} ({wp.floor.name || `Qavat ${wp.floor.floor_number}`})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {auditResult.vertical_connections && auditResult.vertical_connections.length > 0 && (
                  <div className="p-3 bg-primary/5 rounded-md border border-primary/20 text-xs">
                    <p className="font-semibold text-primary mb-1">Vertikal bog'lanishlar (Zina/Lift):</p>
                    <ul className="list-disc pl-4 space-y-2 text-muted-foreground max-h-40 overflow-y-auto mt-2">
                      {auditResult.vertical_connections.map((vc, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="font-medium">{vc.type === 'stairs' ? 'Zina:' : 'Lift:'}</span>
                          <span className="px-2 py-0.5 bg-background rounded border">
                            {vc.from_floor.name || `Qavat ${vc.from_floor.floor_number}`}
                          </span>
                          <span>↔</span>
                          <span className="px-2 py-0.5 bg-background rounded border">
                            {vc.to_floor.name || `Qavat ${vc.to_floor.floor_number}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
